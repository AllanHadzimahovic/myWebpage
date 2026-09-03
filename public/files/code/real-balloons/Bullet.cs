using UnityEngine;

public class Bullet : MonoBehaviour
{
    [SerializeField] private Rigidbody rb;
    [SerializeField] private float bulletSpeed = 5f; 
    [SerializeField] private int bulletDamage = 3; 
    private Transform target;

    public void SetTarget(Transform _target)
    {
        target = _target;
    }

    private void FixedUpdate()
    {
        if(!target)return;
        Vector3 direction = (target.position - transform.position).normalized;
        rb.linearVelocity = direction * bulletSpeed;
    }

    void OnCollisionEnter(Collision other)
    {
        other.gameObject.GetComponent<EnemyScript>().TakeDamage(bulletDamage);
        Destroy(gameObject);
    }
}
