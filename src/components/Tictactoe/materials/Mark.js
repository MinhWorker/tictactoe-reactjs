// Class for managing marks
class Mark {
    constructor(x, y, width, height ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    of({ type = "X", color = "#000", lineWidth = 4 }) {
        this.type = type;
        this.color = color;
        this.lineWidth = lineWidth;
        return this;
    }

    scale(scale) {
        this.x += (this.width * (1 - scale)) / 2;
        this.y += (this.height * (1 - scale)) / 2;
        this.width *= scale;
        this.height *= scale;
        return this;
    }

    render() {
        if (this.type === "X") {
            this.renderX();
        } else if (this.type === "O") {
            this.renderO();
        }
    }

    renderX() {
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.x + this.width, this.y + this.height);
        this.ctx.moveTo(this.x + this.width, this.y);
        this.ctx.lineTo(this.x, this.y + this.height);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    renderO() {
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            0,
            Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
    }
}

export default Mark;