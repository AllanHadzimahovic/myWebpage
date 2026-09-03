using System.Collections;
using System.Runtime.InteropServices;
using JetBrains.Annotations;
using Unity.VisualScripting;
using UnityEngine;

public class CharacterController : MonoBehaviour
{
    [SerializeField] private float jumpStrength;
    [SerializeField] private float movementSpeed;
    [SerializeField] private float extraGravity;
    [SerializeField] private GameObject attackSphere;

    Rigidbody rb;
    BoxCollider attackCollider;
    Animator animator;

    Vector3 inputVector;
    Vector3 lastPos;
    Vector3 currentVelocity;
    Vector3 currentDirection;
    bool isGrounded = true;
    bool isJumping = false;
    bool pressJump = false;
    bool isAttacking = false;
    public float AttackDuration = 0.8f;
    [SerializeField] private int attackDamage = 2;

    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        rb = GetComponent<Rigidbody>();
        attackCollider = GetComponentInChildren<BoxCollider>();
        animator = GetComponentInChildren<Animator>();
    }

    // Update is called once per frame
    void Update()
    {
        //we compare our last saved position with the current one to calculate our velocity
        currentVelocity = transform.position - lastPos;
        //by normalizing this value we get our direction in a way that's very easy to process, -1 in the X axis means we're going left, 1 right, etc...
        currentDirection = currentVelocity.normalized;

        inputVector = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
        inputVector = Vector3.ClampMagnitude(inputVector, 1f);
        animator.SetBool("Walking", inputVector.magnitude > .2f);

         if (Input.GetKeyDown(KeyCode.Space) && isGrounded && !isJumping)
    {
            pressJump = true;
            animator.SetTrigger("JumpTrigger");
            isGrounded = false;   // prevent double trigger
            isJumping = true;     // mark as jumping
    }
        if (Input.GetKeyDown(KeyCode.Space) && !isAttacking)
    {
            
            StartCoroutine(AttackCooldown());
          //  AttackRangeCheck();
    }
        //we add a check to only update where the character looks when we're actually pressing a direction
if (inputVector.magnitude > 0.1f)
{
    Vector3 flatInput = inputVector;
    flatInput.y = 0; // ignore vertical

    if (flatInput.sqrMagnitude > 0.001f)
    {
        Quaternion targetRotation = Quaternion.LookRotation(flatInput);
        Transform model = transform.GetChild(0);
        model.rotation = Quaternion.Slerp(
            model.rotation,
            targetRotation,
            1f * Time.deltaTime
        );

        animator.SetBool("Walking", true);
    }
}
else
{
    animator.SetBool("Walking", false);
}



        GroundCheck();


        //we record our current position
        lastPos = transform.position;

        //to not clutter the update we put the ground check and the visual debugging into their own methods called in the Update
        
    }
    public void EnableAttack()
    {
        isAttacking = false;
    }

     void GroundCheck()
    {
        if (Physics.Raycast(transform.position, Vector3.down, 1f))
        {
            isGrounded = true;
            isJumping = false;
            Debug.Log("You hit");
        }
        //if the raycast doesnt touch anything then it means we are midair
        else
        {
            isGrounded = false;
        }
    }
    
    // Ray ray = new Ray(transform.position, transform.forward);
    // RaycastHit hit;

    // if (Physics.Raycast(ray, out hit, 20f))
    // {
    //     EnemyScript var = hit.collider.GetComponent<EnemyScript>();
    //     var.TakeDamage(attackDamage);
    //     Debug.DrawLine(ray.origin, hit.point, Color.green, 20f);
    //     Debug.Log("You hit");
    // }
    // else
    // {
    //     Debug.DrawRay(ray.origin, ray.direction * 5f, Color.red, 20f);
    //     Debug.Log("You missed");
    // }



    IEnumerator AttackCooldown()
    {
        isAttacking = true;
        animator.SetTrigger("AttackTrigger");
        attackSphere.SetActive(true);
        yield return new WaitForSeconds(AttackDuration);
        attackSphere.SetActive(false);
        isAttacking = false;

    }

    

   private void FixedUpdate()
{
    // Jump
    if (pressJump)
    {
        rb.AddForce(Vector3.up * jumpStrength, ForceMode.VelocityChange);
        pressJump = false;
    }

    // Horizontal movement
    if (inputVector.magnitude > 0.2f)
    {
        rb.MovePosition(rb.position + inputVector * movementSpeed * Time.fixedDeltaTime);
    }

    // Extra gravity
    rb.AddForce(Vector3.down * extraGravity, ForceMode.Acceleration);
}

   
}
