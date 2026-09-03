using UnityEngine;
using System.Collections;
using UnityEngine.UIElements;
using UnityEngine.SceneManagement;

public class GameOverMenuScript : MonoBehaviour
{
    private UIDocument _document;

    private void OnEnable()
    {
        _document = GetComponent<UIDocument>();
        var root = _document.rootVisualElement;
    }

    public void GameOverFunction()
    {
        gameObject.SetActive(true);
        GameStateMachine.Instance.SetState(GameStateMachine.GameStates.Paused);
    }

    

}

