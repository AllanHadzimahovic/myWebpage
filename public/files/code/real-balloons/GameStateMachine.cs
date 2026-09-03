using UnityEngine;

public class GameStateMachine : MonoBehaviour
{
    public static GameStateMachine Instance { get; private set; }

    public enum GameStates { Unpaused, Paused}
    public GameStates CurrentState = GameStates.Unpaused;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    public void SetState(GameStates newState)
    {
        if (CurrentState == newState) return;

        CurrentState = newState;

        switch (newState)
        {
            case GameStates.Unpaused:
                Time.timeScale = 1f;
                break;
            case GameStates.Paused:
                Time.timeScale = 0f;
                break;
        }
    }
  
}
