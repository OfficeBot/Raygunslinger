#pragma strict
private var animator : Animator;

  // Use this for initialization
  function Start() {
      animator = GetComponent("Animator");
  }

  // Update is called once per frame
  function Update() {

      var vertical = Input.GetAxis("Vertical");
      var horizontal = Input.GetAxis("Horizontal");
      animator.SetInteger("Speed", Mathf.Max(vertical, horizontal));
      
      if (vertical > 0)
      {
          animator.SetInteger("Direction", 2);
      }
      else if (vertical < 0)
      {
          animator.SetInteger("Direction", 0);
      }
      else if (horizontal > 0)
      {
          animator.SetInteger("Direction", 1);
      }
      else if (horizontal < 0)
      {
          animator.SetInteger("Direction", 3);
      }
  }