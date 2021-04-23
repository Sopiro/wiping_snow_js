'use strict'

class Vector2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    addS(s)
    {
        return new Vector2(this.x + s, this.y + s);
    }

    subS(s)
    {
        return new Vector2(this.x - s, this.y - s);
    }

    mulS(s)
    {
        return new Vector2(this.x * s, this.y * s);
    }

    divS(s)
    {
        return new Vector2(this.x / s, this.y / s);
    }

    addV(v)
    {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subV(v)
    {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    mulV(v)
    {
        return new Vector2(this.x * v.x, this.y * v.y);
    }

    divV(v)
    {
        return new Vector2(this.x / v.x, this.y / v.y);
    }

    len()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalized()
    {
        const len = this.len();

        return new Vector2(this.x / len, this.y / len);
    }

    dot(v)
    {
        return this.x * v.x + this.y * v.y;
    }
}

class Ball
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

class Wiper
{
    constructor(pos, len, bottomWidth, topWidth)
    {
        this.pos = pos;
        this.len = len;
        this.bottomWidth = bottomWidth;
        this.topWidth = topWidth;

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
        ctx.moveTo(this.tPosBase.subV(this.nor.mulS(this.bottomWidth)).x, this.tPosBase.subV(this.nor.mulS(this.bottomWidth)).y);
        ctx.lineTo(this.tPosTip.subV(this.nor.mulS(this.topWidth)).x, this.tPosTip.subV(this.nor.mulS(this.topWidth)).y);
        ctx.lineTo(this.tPosTip.addV(this.nor.mulS(this.topWidth)).x, this.tPosTip.addV(this.nor.mulS(this.topWidth)).y);
        ctx.lineTo(this.tPosBase.addV(this.nor.mulS(this.bottomWidth)).x, this.tPosBase.addV(this.nor.mulS(this.bottomWidth)).y);
        ctx.lineTo(this.tPosBase.subV(this.nor.mulS(this.bottomWidth)).x, this.tPosBase.subV(this.nor.mulS(this.bottomWidth)).y);
        ctx.fill();
    }
}

class Game
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;

        this.cvs = document.getElementById("cvs");
        this.cvs.setAttribute("width", width);
        this.cvs.setAttribute("height", height);
        this.ctx = this.cvs.getContext("2d");

        this.times = [];
    }

    start()
    {
        this.init();
        this.run();
    }

    init()
    {
        this.friction = 0.995;
        this.gravity = 0.15;
        this.screenBounds = false;
        this.maxBalls = 180;
        this.balls = [];
        this.spread = 0.8;
        this.wiperForce = 3.0;
        this.wiperSpeed = 1.5;
        this.stepDivision = 2.5 * this.wiperSpeed + 1;
        this.wiper = new Wiper(new Vector2(this.width / 2.0, this.height), this.height * 0.95, 11, 4);

        for (let i = 0; i < this.maxBalls - this.balls.length; i++)
        {
            let b = new Ball(new Vector2(
                (Math.random() - 0.5) * this.width * this.spread + this.width / 2.0,
                (Math.random() - 0.5) * this.height * this.spread + this.height / 2.0 - this.height), Math.random() * 10 + 12);

            b.addForce(new Vector2((Math.random() - 0.5), (Math.random() - 0.5)).mulV(new Vector2(100, 200)));
            this.balls.push(b);
        }

        let b = new Ball(new Vector2(500, 100), 10);
        b.addForce(new Vector2(0, 0));

        this.balls.push(b);

        b = new Ball(new Vector2(200, 110), 10);
        b.addForce(new Vector2(-10, 0));

        this.balls.push(b);
    }

    run()
    {
        const now = performance.now();

        this.times.push(now);

        if (now - this.times[0] > 1000)
            this.times.shift();

        this.update((now - this.times[this.times.length - 2]) / 1000);
        this.render();

        requestAnimationFrame(this.run.bind(this));
    }

    update(delta)
    {
        this.balls.forEach(b =>
        {
            b.addForce(new Vector2(0, this.gravity));
            b.updateFriction(this.friction);
        });

        for (let i = 0; i < this.stepDivision; i++)
        {
            this.balls.forEach(b =>
            {
                b.update(this.stepDivision);
            });

            let colliders = [];

            const angleDifferential = Math.abs(Math.cos(performance.now() * this.wiperSpeed / 1000.0));

            // this.wiper.update(0.8);
            this.wiper.update(Math.sin(performance.now() * this.wiperSpeed / 1000.0) * 1.5);

            this.balls.forEach(b =>
            {
                this.balls.forEach(t =>
                {
                    if (b === t) return;

                    let dir = t.pos.subV(b.pos);
                    const dist = dir.len();

                    if (dist < b.r + t.r)
                    {
                        colliders.push([b, t]);
                        dir = dir.normalized();

                        const gap = b.r + t.r - dist;

                        b.pos = b.pos.addV(dir.mulS(-gap / 2.0));
                        t.pos = t.pos.addV(dir.mulS(gap / 2.0));
                    }
                })
            });

            this.balls.forEach(b =>
            {
                const mid = this.wiper.tPosBase.addV(this.wiper.tPosTip).divS(2.0);

                if (this.wiper.len / 2.0 + this.wiper.bottomWidth + this.wiper.topWidth < b.pos.subV(mid).len() + b.r)
                    return;

                const baseToBall = b.pos.subV(this.wiper.tPosBase);
                const bound = this.wiper.dir.dot(baseToBall);

                if (bound < 0)
                {
                    let dir = b.pos.subV(this.wiper.tPosBase);
                    const dist = dir.len();

                    if (dist < b.r + this.wiper.bottomWidth)
                    {
                        dir = dir.normalized();
                        const gap = this.wiper.bottomWidth + b.r - dist;
                        b.pos = b.pos.addV(dir.mulS(gap));
                    }
                }

                if (bound >= this.wiper.len)
                {
                    let dir = b.pos.subV(this.wiper.tPosTip);
                    const dist = dir.len();

                    if (dist < b.r + this.wiper.topWidth)
                    {
                        dir = dir.normalized();
                        const gap = this.wiper.topWidth + b.r - dist;
                        b.pos = b.pos.addV(dir.mulS(gap));
                    }
                }

                if (bound > 0 && bound <= this.wiper.len)
                {
                    const nor = this.wiper.nor.mulS(this.wiper.nor.dot(baseToBall));
                    const dist = nor.len();

                    const boundsPercentage = bound / this.wiper.len;
                    const lerpedR = boundsPercentage * this.wiper.topWidth + (1 - boundsPercentage) * this.wiper.bottomWidth;

                    if (dist < lerpedR + b.r)
                    {
                        const topOrBott = this.wiper.nor.dot(baseToBall) > 0 ? 1 : -1;
                        const gap = lerpedR + b.r - dist;
                        b.pos = b.pos.addV(this.wiper.nor.mulS(gap * topOrBott));

                        b.v = b.v.addV(this.wiper.nor.mulS(this.wiper.nor.dot(b.v) * -2));
                        b.addForce(nor.mulS(boundsPercentage * this.wiperForce * angleDifferential));
                    }
                }
            });

            colliders.forEach(pair =>
            {
                const b = pair[0];
                const t = pair[1];

                const dir = t.pos.subV(b.pos).normalized();
                const nor = new Vector2(-dir.y, dir.x);

                const u1 = dir.dot(b.v);
                const u2 = dir.dot(t.v);

                const vn1 = nor.dot(b.v);
                const vn2 = nor.dot(t.v);

                const vd1 = (((b.mass - t.mass) * u1) + (2 * t.mass * u2)) / (b.mass + t.mass);
                const vd2 = (((t.mass - b.mass) * u2) + (2 * b.mass * u1)) / (b.mass + t.mass);

                b.v = dir.mulS(vd1).addV(nor.mulS(vn1));
                t.v = dir.mulS(vd2).addV(nor.mulS(vn2));
            });

            for (let i = 0; i < this.maxBalls - this.balls.length; i++)
            {
                let b = new Ball(new Vector2(
                    (Math.random() - 0.5) * this.width * this.spread + this.width / 2.0,
                    (Math.random() - 0.5) * this.height * this.spread + this.height / 2.0 - this.height), Math.random() * 10 + 12);

                b.addForce(new Vector2((Math.random() - 0.5), (Math.random() - 0.5)).mulV(new Vector2(100, 200)));
                this.balls.push(b);
            }

            for (let i = 0; i < this.balls.length; i++)
            {
                const b = this.balls[i];

                if (this.screenBounds)
                {
                    if (b.pos.x - b.r < 0)
                    {
                        b.pos.x = b.r;
                        b.v.x = b.v.x * -1;
                    }
                    if (b.pos.y - b.r < 0)
                    {
                        b.pos.y = b.r;
                        b.v.y = b.v.y * -1;
                    }
                    if (b.pos.x + b.r >= this.width)
                    {
                        b.pos.x = this.width - b.r;
                        b.v.x = b.v.x * -1;
                    }
                    if (b.pos.y + b.r >= this.height)
                    {
                        b.pos.y = this.height - b.r;
                        b.v.y = b.v.y * -1;
                    }
                }
                else
                {
                    if (b.pos.x + b.r < 0)
                    {
                        this.balls.splice(i, 1);
                    }
                    if (b.pos.x - b.r >= this.width)
                    {
                        this.balls.splice(i, 1);
                    }
                    if (b.pos.y - b.r >= this.height)
                    {
                        this.balls.splice(i, 1);
                    }
                }
            }
        }
    }

    render()
    {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.font = '20px sansserif';
        this.ctx.fillText(this.times.length - 1 + "fps", 5, 20);

        this.balls.forEach(b =>
        {
            b.render(this.ctx);
        });

        this.wiper.render(this.ctx);
    }
}

var game;

window.onload = () =>
{
    game = new Game(1280, 720);
    game.start();
}