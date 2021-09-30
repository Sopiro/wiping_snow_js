import { Vector2 } from "./vector2.js";

export class Ball
{
    constructor(pos, r)
    {
        this.pos = pos;
        this.r = r;
        this.mass = r;
        this.v = new Vector2(0, 0);
    }

    addForce(f)
    {
        this.v = this.v.addV(f.divS(this.mass));
    }

    update(stepDivision)
    {
        this.pos = this.pos.addV(this.v.divS(stepDivision));
    }

    updateFriction(friction)
    {
        this.v = this.v.mulS(friction);
    }

    render(ctx)
    {
        ctx.beginPath();
        ctx.fillStyle = "azure";
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
}