using UnityEngine;

public class GlobalInputManager : MonoBehaviour
{
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    [SerializeField] private PauseMenuEvents pauseMenu;
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {

    if (Input.GetKeyDown(KeyCode.P))
    {
        if(GameStateMachine.Instance.CurrentState == GameStateMachine.GameStates.Unpaused)
            pauseMenu.PauseFunction();
        else 
            pauseMenu.UnpauseFunction();

    }
    }

}
