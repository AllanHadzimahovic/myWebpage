using UnityEngine;

public class LevelManager : MonoBehaviour
{
    public static LevelManager main;

    public Transform startPoint;
    public Transform[] path;
    public int goldAmount;
    
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Awake()
    {
        main = this;
    }

    void Start()
    {
        goldAmount = 100;
    }

    public void IncreaseGold(int amount)
    {
        goldAmount += amount;
    }

    public void SpendGold()
    {
        goldAmount -= 100;
    }
}
