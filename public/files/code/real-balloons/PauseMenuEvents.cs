using UnityEngine;
using System.Collections;
using UnityEngine.UIElements;
using UnityEngine.SceneManagement;

public class PauseMenuEvents : MonoBehaviour
{
    private UIDocument _document;



    private void OnSettingsButtonClick()
    {
        Debug.Log("You pressed the Settings button");
    }

    public void OnRestartButtonClick()
    {
    
        SceneManager.LoadScene(0);
        GameStateMachine.Instance.SetState(GameStateMachine.GameStates.Unpaused);

    }

   
     private void OnQuitToMenuButton()
    {
        Debug.Log("You pressed the Quit to Menu button");
    }

     private void OnQuitGameButton()
    {
        Application.Quit();
    }

    public void UnpauseFunction()
        {
            gameObject.SetActive(false);
            GameStateMachine.Instance.SetState(GameStateMachine.GameStates.Unpaused);
        }

   

    public void PauseFunction()
    {
        gameObject.SetActive(true);
        GameStateMachine.Instance.SetState(GameStateMachine.GameStates.Paused);
    }

    

    

}

