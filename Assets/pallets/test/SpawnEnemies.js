#pragma strict
var spawnPoints : GameObject[];
var enemyPrefab : GameObject;

function Start () {
	spawnPoints = GameObject.FindGameObjectsWithTag("Spawn");
	DoSpawn();
}

function DoSpawn() {
	while (true) {
		var numberOfPoints = spawnPoints.length;
		var spawnPointIndex : int = Random.Range(0, numberOfPoints-1);
		var spawnPoint : GameObject = spawnPoints[spawnPointIndex];
		var enemy : GameObject = Instantiate(enemyPrefab, spawnPoint.transform.position, Quaternion.identity);
		var waitTime = Random.Range(.5,2);
		yield WaitForSeconds (waitTime);
	}
}