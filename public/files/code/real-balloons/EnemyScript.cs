using Unity.VisualScripting;
using UnityEngine;

public class EnemyScript : MonoBehaviour
{
    [SerializeField] private float EnemyMovementSpeed = 2f;
    [SerializeField] private Rigidbody rb; 

    private Transform target; 
    private int pathIndex = 0;
    [SerializeField] private int health = 5; 
    [SerializeField] private int attackDamage = 5;
    private bool isDestroyed = false;
    [SerializeField] private int goldWorth = 50;

   void Start()
    {
        target = LevelManager.main.path[pathIndex];
    }

    private void Update()
    {
        if (Vector3.Distance(target.position, transform.position) <= 0.1f){
            pathIndex++;
        
            if(pathIndex == LevelManager.main.path.Length)
            {
            EnemySpawner.onEnemyDestroy.Invoke();
            HomeScript.main.TakeDamage(attackDamage);
            Destroy(gameObject);
            return;
            }
            else {
            target = LevelManager.main.path[pathIndex];
            }
        }
    }

    private void FixedUpdate()
    {
        Vector3 direction = (target.position - transform.position).normalized;

        rb.MovePosition(rb.position + direction * EnemyMovementSpeed * Time.fixedDeltaTime);
 
    }

    public void TakeDamage(int dmg)
    {
        health -= dmg;

        if (health <= 0 && !isDestroyed)
        {
            EnemySpawner.onEnemyDestroy.Invoke();
            LevelManager.main.IncreaseGold(goldWorth);
            isDestroyed = true;
            Destroy(gameObject);
            
        }
    }
}
