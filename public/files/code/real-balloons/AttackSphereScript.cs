using UnityEngine;

public class AttackCollider : MonoBehaviour
{
    [SerializeField] private int damage = 5;

    private void OnTriggerEnter(Collider other)
    {
        EnemyScript enemy = other.GetComponent<EnemyScript>();
        if (enemy != null)
        {
            enemy.TakeDamage(damage);
            Debug.Log("Hit " + enemy.name);
        }
    }
}
