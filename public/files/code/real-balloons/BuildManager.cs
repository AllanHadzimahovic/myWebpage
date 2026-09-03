using UnityEngine;

public class BuildManager : MonoBehaviour
{
   public static BuildManager main;
   [SerializeField] private GameObject[] towerPrefabs;
   private int selectedTower = 0;
   
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Awake()
    {
        main = this;
    }

    public GameObject GetSelectedTower()
    {
        return towerPrefabs[selectedTower];
    }
}
