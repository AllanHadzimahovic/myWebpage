using UnityEngine;

public class ChangeColor : MonoBehaviour
{
    private MeshRenderer renderer;
    public Material NewMaterial;

    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
       
    }

    // Update is called once per frame
    public void SetNewMaterial()
    {
        renderer = GetComponentInChildren<MeshRenderer>();
        renderer.material = NewMaterial;
    }
}
