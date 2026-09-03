using Unity.Mathematics;
using UnityEngine;

public class PlaneScript : MonoBehaviour
{
    public int towerCost = 100;
    private GameObject tower;

    
    private void OnMouseDown()
    {
        if (tower != null) return;
        GameObject towerToBuild = BuildManager.main.GetSelectedTower();
        if (towerCost > LevelManager.main.goldAmount)
        {
            Debug.Log("Not enough Gold");
        }
        else
        {
              tower = Instantiate(towerToBuild, transform.position, quaternion.identity);
              LevelManager.main.SpendGold();
        
        }
    }
}
