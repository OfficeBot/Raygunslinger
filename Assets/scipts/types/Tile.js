#pragma strict
private var spriteRenderer : SpriteRenderer;
private var biasedBaseTiles = new Array();
var totalBias : int;

class tileStruct {
	var tile : GameObject;
	var bias : Number = 1;
}

var position : Vector2;

var base : tileStruct[];
var topEdge : GameObject;
var rightEdge : GameObject;
var bottomEdge : GameObject;
var leftEdge : GameObject;

var walkSound : AudioClip;


var brightness : int = 1;
var colorVariance : float = 0.05;

function GetBaseTile(bias : int) {
	if (bias >= biasedBaseTiles.length || bias < 0) {
		return base[0].tile;
	};
	var tileLookup = biasedBaseTiles[bias];
	return base[tileLookup].tile;
}

function GetRandomBaseTile() {
	var randomBias = Random.Range(0,totalBias);
	// Debug.Log(randomBias);
	var newTile = GetBaseTile(randomBias);
	return newTile;
}

function Brightness(newBrigthness : float) {
	brightness = newBrigthness;
	spriteRenderer.color = Color(newBrigthness,newBrigthness,newBrigthness);
}

function Start () {
	spriteRenderer = gameObject.GetComponent(SpriteRenderer);
	//calculate bias range for fetching tiles
	totalBias = 0;
	var k : int;
	var q : int;
	for (k = 0; k < base.length; k++) {
		totalBias += base[k].bias;
	};

	// biasedBaseTiles = new int[totalBias];
	for (k = 0; k < base.length; k++) {
		for (q = 0; q < base[k].bias; q++) {
			biasedBaseTiles.push(k);
		}
	};
	//render the tile
	var randomTile = GetRandomBaseTile();
	spriteRenderer.sprite = randomTile.GetComponent(SpriteRenderer).sprite;
	Brightness(Random.Range(1.0 - colorVariance,1.0));
}

function Update () {

}