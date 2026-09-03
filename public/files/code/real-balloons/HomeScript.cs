using UnityEngine;

public class HomeScript : MonoBehaviour
{
    public static HomeScript main;
    [SerializeField] public int homeHealth = 100;
    [SerializeField] private GameOverMenuScript obj;


    private void Awake()
    {
        main = this;
    }

    public void TakeDamage(int damage)
    {
        homeHealth -= damage;

        if (homeHealth <= 0)
        {
            obj.GameOverFunction(); 
        }
    }
}
