import { useCallback, useEffect, useRef, useState } from 'react'
import { LowPowerMediaNote, useLowPower } from './lowPower.jsx'
import PokemonTextBox from './PokemonTextBox.jsx'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

const WEB_FORMATS = new Set(['stl', 'glb', 'gltf', 'obj'])

function extensionOf(name = '') {
  const parts = name.toLowerCase().split('.')
  return parts.length > 1 ? parts.pop() : ''
}

function disposeObject(root) {
  root.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if (material.map) material.map.dispose()
        material.dispose()
      })
    }
  })
}

function fitCameraToObject(camera, controls, object, offset = 1.35) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  const fov = (camera.fov * Math.PI) / 180
  let distance = maxDim / (2 * Math.tan(fov / 2))
  distance *= offset

  camera.near = Math.max(distance / 100, 0.01)
  camera.far = distance * 100
  camera.updateProjectionMatrix()

  camera.position.set(center.x + distance * 0.55, center.y + distance * 0.35, center.z + distance)
  camera.lookAt(center)
  controls.target.copy(center)
  controls.minDistance = maxDim * 0.2
  controls.maxDistance = distance * 8
  controls.update()
}

function fixMagicsRedBlueSwap(geometry) {
  // three.js STLLoader historically maps Magics packed RGB with R/B swapped vs the Magics spec.
  // Swap channels so Fusion/ATF facet colors match the CAD appearance more closely.
  const color = geometry.getAttribute('color')
  if (!color) return
  for (let i = 0; i < color.count; i += 1) {
    const r = color.getX(i)
    const b = color.getZ(i)
    color.setX(i, b)
    color.setZ(i, r)
  }
  color.needsUpdate = true
}

function meshFromGeometry(geometry) {
  geometry.computeVertexNormals()
  const hasColors = Boolean(geometry.hasColors && geometry.getAttribute('color'))
  if (hasColors) fixMagicsRedBlueSwap(geometry)

  const material = new THREE.MeshPhongMaterial({
    // Preserve STL Magics / COLOR= vertex colors when present.
    color: hasColors ? 0xffffff : 0xb0b8c4,
    vertexColors: hasColors,
    specular: 0x333333,
    shininess: hasColors ? 40 : 60,
    opacity: geometry.alpha ?? 1,
    transparent: (geometry.alpha ?? 1) < 1,
    flatShading: false,
  })
  return new THREE.Mesh(geometry, material)
}

async function loadModelFromFile(file) {
  const ext = extensionOf(file.name)
  const buffer = await file.arrayBuffer()

  if (ext === 'stl') {
    const geometry = new STLLoader().parse(buffer)
    return meshFromGeometry(geometry)
  }

  if (ext === 'glb' || ext === 'gltf') {
    const gltf = await new GLTFLoader().parseAsync(buffer, '')
    return gltf.scene
  }

  if (ext === 'obj') {
    const text = new TextDecoder().decode(buffer)
    return new OBJLoader().parse(text)
  }

  throw new Error(`Unsupported format: .${ext}`)
}

async function loadModelFromUrl(url) {
  const ext = extensionOf(url.split('?')[0])
  if (ext === 'stl') {
    const geometry = await new STLLoader().loadAsync(url)
    return meshFromGeometry(geometry)
  }
  if (ext === 'glb' || ext === 'gltf') {
    const gltf = await new GLTFLoader().loadAsync(url)
    return gltf.scene
  }
  if (ext === 'obj') {
    return new OBJLoader().loadAsync(url)
  }
  throw new Error(`Unsupported model URL: ${url}`)
}

/**
 * Interactive CAD viewer: drag to rotate, scroll to zoom, right-drag to pan.
 * Accepts STL / GLB / glTF / OBJ. .f3d is Fusion-native and cannot be rendered in-browser.
 */
export default function ModelViewer({
  title = '3D model',
  src,
  allowUpload = true,
  note,
}) {
  const { lowPower } = useLowPower()
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const [status, setStatus] = useState(src ? 'Loading model…' : 'Upload a model to inspect it')
  const [error, setError] = useState('')
  const [fileLabel, setFileLabel] = useState(src ? src.split('/').pop() : '')
  const [dragging, setDragging] = useState(false)

  const replaceModel = useCallback(async (loader) => {
    const sceneApi = sceneRef.current
    if (!sceneApi) return

    setError('')
    setStatus('Loading model…')

    try {
      const object = await loader()
      if (sceneApi.model) {
        sceneApi.scene.remove(sceneApi.model)
        disposeObject(sceneApi.model)
      }

      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          if (!child.material) {
            child.material = new THREE.MeshPhongMaterial({
              color: 0xb0b8c4,
              specular: 0x333333,
              shininess: 60,
            })
          }
        }
      })

      sceneApi.scene.add(object)
      sceneApi.model = object
      fitCameraToObject(sceneApi.camera, sceneApi.controls, object)
      setStatus('Drag to rotate · scroll to zoom · right-drag to pan')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not load that file')
      setStatus('Upload failed')
    }
  }, [])

  useEffect(() => {
    if (lowPower) return undefined
    const mount = mountRef.current
    if (!mount) return undefined

    const width = mount.clientWidth || 640
    const height = mount.clientHeight || 420

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x141820)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000)
    camera.position.set(2.5, 1.8, 3.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    // Neutral lights so STL vertex colors stay true-to-file (no teal/blue cast).
    const hemi = new THREE.HemisphereLight(0xffffff, 0x3a3a42, 0.95)
    scene.add(hemi)
    const key = new THREE.DirectionalLight(0xffffff, 1.05)
    key.position.set(4, 8, 5)
    key.castShadow = true
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.4)
    fill.position.set(-5, 2, -3)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffffff, 0.25)
    rim.position.set(0, -4, -6)
    scene.add(rim)

    const grid = new THREE.GridHelper(10, 20, 0x3a4254, 0x242a38)
    grid.position.y = -0.001
    scene.add(grid)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = true
    controls.rotateSpeed = 0.9

    const api = { scene, camera, renderer, controls, model: null, grid }
    sceneRef.current = api

    let frame = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (w < 2 || h < 2) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(mount)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('resize', onResize)
      controls.dispose()
      if (api.model) disposeObject(api.model)
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
      sceneRef.current = null
    }
  }, [lowPower])

  useEffect(() => {
    if (!src || !sceneRef.current) return
    setFileLabel(src.split('/').pop() || src)
    replaceModel(() => loadModelFromUrl(src))
  }, [src, replaceModel])

  async function handleFiles(fileList) {
    if (!allowUpload) return
    const file = fileList?.[0]
    if (!file) return

    const ext = extensionOf(file.name)
    setFileLabel(file.name)

    if (ext === 'f3d' || ext === 'f3z') {
      setError(
        `.${ext} is Autodesk Fusion’s native format. Browsers cannot render it directly. Export STL or glTF from Fusion instead.`,
      )
      setStatus('Needs a mesh export from Fusion')
      return
    }

    if (!WEB_FORMATS.has(ext)) {
      setError('Supported formats: .stl, .glb, .gltf, .obj.')
      setStatus('Unsupported file type')
      return
    }

    await replaceModel(() => loadModelFromFile(file))
  }

  function onDrop(event) {
    event.preventDefault()
    setDragging(false)
    if (allowUpload) handleFiles(event.dataTransfer.files)
  }

  const dropHandlers = allowUpload
    ? {
        onDragEnter: (event) => {
          event.preventDefault()
          setDragging(true)
        },
        onDragOver: (event) => {
          event.preventDefault()
          setDragging(true)
        },
        onDragLeave: () => setDragging(false),
        onDrop,
      }
    : {}

  if (lowPower) {
    return (
      <LowPowerMediaNote>
        The 3D viewer is paused in low-power mode (no WebGL). Turn the sun off to inspect the model.
      </LowPowerMediaNote>
    )
  }

  return (
    <div className="model-viewer">
      <div className="model-viewer__toolbar">
        <div>
          <p className="model-viewer__title">{title}</p>
          <PokemonTextBox
            compact
            label={`${title} status`}
            text={fileLabel ? `${fileLabel} — ${status}` : status}
          />
        </div>
        {allowUpload ? (
          <label className="model-viewer__upload">
            Upload model
            <input
              type="file"
              accept=".stl,.glb,.gltf,.obj,.f3d,.f3z"
              onChange={(event) => {
                handleFiles(event.target.files)
                event.target.value = ''
              }}
            />
          </label>
        ) : null}
      </div>

      <div
        className={`model-viewer__canvas${dragging ? ' is-dragging' : ''}`}
        ref={mountRef}
        {...dropHandlers}
      />

      {error ? <PokemonTextBox text={error} label={`${title} error`} /> : null}
      {note ? <PokemonTextBox text={note} label={`${title} note`} /> : null}
    </div>
  )
}
