using UnityEngine;
using UnityEngine.UIElements;

public class HUD : MonoBehaviour
{
    private UIDocument _document;
    private Label healthLabel;
    private Label goldLabel;

    private void OnEnable()
    {
        _document = GetComponent<UIDocument>();
        var root = _document.rootVisualElement;

        healthLabel = root.Q<Label>("HealthLabel");
        goldLabel = root.Q<Label>("GoldLabel");
    }

    private void Update()
    {
        if (healthLabel != null && HomeScript.main != null)
            healthLabel.text = "Health: " + HomeScript.main.homeHealth;

        if (goldLabel != null && LevelManager.main != null)
            goldLabel.text = "Gold: " + LevelManager.main.goldAmount;
    }
}
