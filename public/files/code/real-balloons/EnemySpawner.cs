using System;
using System.Collections;
using Unity.Mathematics;
using UnityEngine;
using UnityEngine.Events;

public class EnemySpawner : MonoBehaviour
{
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    
   
    [SerializeField] private GameObject [] enemyPrefabs;
    [SerializeField] private int baseEnemies = 8;
    [SerializeField] private float enemiesPerSecond = 0.5f;
    [SerializeField] private float timeBetweenWaves = 5f;
    [SerializeField] private float difficultyScalingFactor = 0.75f;

    public static UnityEvent onEnemyDestroy = new UnityEvent();
    
    private int currentWave = 1;
    private float timeSinceLastSpawn;
    private int enemiesAlive;
    private int enemiesLeftToSpawn;
    private bool isSpawning = false;

    private void Awake()
    {
     onEnemyDestroy.AddListener(EnemyDestroyed);  
    }

   
    private void Start()
        {
        StartCoroutine(StartWave());
        }
    
    void Update()
    {
        if (!isSpawning) return;
        timeSinceLastSpawn += Time.deltaTime;
        if (timeSinceLastSpawn >= (1f/enemiesPerSecond) && enemiesLeftToSpawn > 0)
        {
            SpawnEnemy();
            enemiesLeftToSpawn --;
            enemiesAlive ++;
            timeSinceLastSpawn = 0f;
        } 
        if (enemiesAlive == 0 && enemiesLeftToSpawn == 0)
            {
            EndWave();
            }
    }
    
    IEnumerator StartWave()
    {
        yield return new WaitForSeconds(timeBetweenWaves);
        isSpawning = true;
        
        enemiesLeftToSpawn = EnemiesPerWave();   
    }

    private void EndWave()
        {
        isSpawning = false;
        timeSinceLastSpawn = 0f;
        currentWave++;
        StartCoroutine(StartWave());
        }
    void SpawnEnemy()
    {
        GameObject prefabToSpawn = enemyPrefabs[0];
        Instantiate(prefabToSpawn, LevelManager.main.startPoint.position, quaternion.identity);
    }
    
    private int EnemiesPerWave()
    {
        return Mathf.RoundToInt(baseEnemies * MathF.Pow(currentWave, difficultyScalingFactor));
    }

    private void EnemyDestroyed()
    {
        enemiesAlive--;
    }

    

    
}
