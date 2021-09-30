import { Vector2 } from "./vector2.js";

export class Wiper
{
    constructor(pos, len, bottomRad, topRad)
    {
        this.pos = pos;
        this.len = len;
        this.bottomRad = bottomRad;
        this.topRad = topRad;

        this.base = new Vector2(0, 0);
        this.tip = new Vector2(0, -len);

        this.update();
    }

    update(rot = 0.0)
    {
        let cos = Math.cos(rot);
        let sin = Math.sin(rot);

        this.tPosBase = new Vector2(cos * this.base.x - sin * this.base.y, sin * this.base.x + cos * this.base.y);
        this.tPosTip = new Vector2(cos * this.tip.x - sin * this.tip.y, sin * this.tip.x + cos * this.tip.y);

        this.tPosBase = this.tPosBase.addV(this.pos);
        this.tPosTip = this.tPosTip.addV(this.pos);

        this.dir = this.tPosTip.subV(this.tPosBase).normalized();
        this.nor = new Vector2(-this.dir.y, this.dir.x);
    }

    render(ctx)
    {
        ctx.beginPath();
        ctx.fillStyle = "#202224";
        ctx.moveTo(this.tPosBase.subV(this.nor.mulS(this.bottomRad)).x, this.tPosBase.subV(this.nor.mulS(this.bottomRad)).y);
        ctx.lineTo(this.tPosTip.subV(this.nor.mulS(this.topRad)).x, this.tPosTip.subV(this.nor.mulS(this.topRad)).y);
        ctx.lineTo(this.tPosTip.addV(this.nor.mulS(this.topRad)).x, this.tPosTip.addV(this.nor.mulS(this.topRad)).y);
        ctx.lineTo(this.tPosBase.addV(this.nor.mulS(this.bottomRad)).x, this.tPosBase.addV(this.nor.mulS(this.bottomRad)).y);
        ctx.lineTo(this.tPosBase.subV(this.nor.mulS(this.bottomRad)).x, this.tPosBase.subV(this.nor.mulS(this.bottomRad)).y);
        ctx.fill();
    }
}
