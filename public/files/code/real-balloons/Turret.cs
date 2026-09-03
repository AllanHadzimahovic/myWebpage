using UnityEngine;
using Unity.Mathematics;

using UnityEditor;


public class Turret : MonoBehaviour
{
    [SerializeField] private float targetingRange = 5f;
    [SerializeField] private Transform turretRotationPoint;
    [SerializeField] private LayerMask enemyMask;
    [SerializeField] private GameObject bulletPrefab;
    [SerializeField] private Transform firingPoint;
    [SerializeField] private float bps = 1f;     
    [SerializeField] private Collider [] hits;
    public int Cost = 100;

    private Transform target;
    private float timeUntilFire;

    
    private void Update()
    {
        if (target == null)
            {
            FindTarget();
            return;
            }
        
        if (!CheckTargetIsInRange())
        {
         target = null;   
        }
        else
        {
            timeUntilFire += Time.deltaTime;
            if(timeUntilFire >= 1f / bps)
            {
                Shoot();
                timeUntilFire = 0f;
            }
        }

    }


    private void FindTarget()
    {
        hits = Physics.OverlapSphere(transform.position,targetingRange, enemyMask); 
        if (hits.Length > 0)
        {
            target = hits[0].transform; 
        }
        

    }
    private void OnDrawGizmosSelected();

    

    private bool CheckTargetIsInRange()
    {
        return Vector3.Distance(target.position, transform.position) <= targetingRange;
    }

    private void Shoot()
    {
        GameObject bulletObj = Instantiate(bulletPrefab,firingPoint.position, quaternion.identity);
        Bullet bulletScript = bulletObj.GetComponent<Bullet>();
        bulletScript.SetTarget(target);
    }



}
