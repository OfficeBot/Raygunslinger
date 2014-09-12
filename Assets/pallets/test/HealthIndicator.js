#pragma strict
 var player : GameObject;
 var playerController : New_Controller;
 var playerHealth : float;
 var playerMaxHealth : float;
 var rootMaterial : Material;

function Start () {
	player = GameObject.Find("Player");
	playerController = player.GetComponent(New_Controller);
	playerHealth = playerController.health;
	playerMaxHealth = playerHealth;
	rootMaterial = renderer.material;

}

function Update () {
	playerHealth = playerController.health;
	var damage = playerHealth / playerMaxHealth;
	// Debug.Log(damage);
	rootMaterial.color.a = 1 - damage;
}