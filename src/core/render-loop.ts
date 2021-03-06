/**
 * Render frames depending on loop.
 */
export default class RenderLoop {
  collision: any;
  collisionBounce: any;
  collisionProjectile: any;
  stage: any;
  view: any;
  collisionTypes: string[];
  isAnimating: boolean;
  clear: boolean;
  smear: number;
  animateTime: number;

  /**
   * Set dependencies and bind events.
   */
  constructor(params: any) {
    // Instance
    this.collision = params.collision;
    this.collisionBounce = params.collisionBounce;
    this.collisionProjectile = params.collisionProjectile;
    this.stage = params.stage;
    this.view = params.view;

    // Values
    this.collisionTypes = ['ShipEnemyObject', 'ShipPlayerObject'];
    this.isAnimating = false;
    this.clear = false; // If not, draw over
    this.smear = 0.5; // Blur FX; lower values = More blur
    this.animateTime = 2000; // ^= Ship : PLayer

    this.bindEvents();
  }

  /**
   * Update objects, render, hit test.
   */
  run() {
    const { objects } = this.stage;

    this.reset();

    for (let i = 0; i < objects.length; i++) {
      objects[i].move();
      objects[i].draw();
    }

    this.testObjects();
  }

  /**
   * Hit test objects.
   *
   * @todo Outsource collision detection (inject, pass objects, let them filter)
   */
  testObjects() {
    const { objects } = this.stage;

    const testCollisionShip = [];
    const testCollisionShipBounce = [];
    const testCollisionProjectile = [];

    // Filter to test objects that can collide only
    for (let i = 0; i < objects.length; i++) {
      const type = objects[i].__proto__.constructor.name;
      const isMatch = this.collisionTypes.indexOf(type) >= 0;

      if (isMatch) {
        testCollisionShip.push(objects[i]);
        testCollisionShipBounce.push(objects[i]);
      } else {
        testCollisionProjectile.push(objects[i]);
      }
    }

    this.collision.testObjects(testCollisionShip);
    this.collisionBounce.testObjects(testCollisionShipBounce);
    this.collisionProjectile.testObjects(testCollisionProjectile);
  }

  /**
   * Reset view by transparent overlay (for effect reasons).
   */
  reset() {
    const { view } = this;
    const { ctx } = view;

    if (this.clear) {
      ctx.clearRect(0, 0, view.width, view.height);
    } else {
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${this.smear})`;
      ctx.fillRect(0, 0, view.width, view.height);
      ctx.restore();
    }
  }

  /**
   * Set speed animation effect.
   */
  setFx() {
    if (this.isAnimating) {
      return;
    }

    const smearOld = this.smear;

    this.smear = 0.1;
    this.isAnimating = true;

    window.setTimeout(() => {
      this.smear = smearOld;
      this.isAnimating = false;
    }, this.animateTime);
  }

  /**
   * Events.
   */
  bindEvents() {
    window.addEventListener(
      'controls:keydown',
      (event: any) => {
        const ev = event.detail.data;

        // Manually run
        if (ev.shiftKey) {
          this.setFx();
        }
      },
      true,
    );
  }
}
