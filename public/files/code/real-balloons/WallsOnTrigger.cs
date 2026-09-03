using UnityEngine;

public class WallsOnTrigger : MonoBehaviour
{
    private void OnTriggerEnter(Collider other)
    {
        ChangeColor changeCol = other.GetComponent<ChangeColor>();
        if (changeCol!=null)
            changeCol.SetNewMaterial();


        
    }
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
