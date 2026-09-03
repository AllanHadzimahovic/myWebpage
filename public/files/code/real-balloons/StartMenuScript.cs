using UnityEngine;
using System.Collections;
using UnityEngine.UIElements;
using UnityEngine.SceneManagement;

public class StartMenuScript : MonoBehaviour
{
    private UIDocument _document;

    private void Start()
    { 
        gameObject.SetActive(true);
        GameStateMachine.Instance.SetState(GameStateMachine.GameStates.Paused);

    }

    public void StartFunction()
        {
            gameObject.SetActive(false);
            GameStateMachine.Instance.SetState(GameStateMachine.GameStates.Unpaused);
        }

    private void OnSettingsButtonClick()
    {
        Debug.Log("You pressed the Settings Button");
    }

        private void OnQuitGameButton()
    {
        Application.Quit();
    }

}

