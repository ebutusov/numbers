export class GWindow {

  constructor(text,x,y,timeout) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.timeout = timeout;
    this.el = null;
    this.section = null;
    this.isHit = false;
    this.points = 0;
  }

  addToDoc(section) {
    const el = document.querySelector("#template > div").cloneNode(true);
    el.querySelector(".gwin-text").innerHTML = this.text;
    el.querySelector(".gwin-counter").innerText = this.timeout;
    el.style.transform = `translate(${section.offsetWidth/2}px, ${-200}px`
    this.el = el;
    this.section = section;
    section.appendChild(el);
    setTimeout(()=> el.style.transform = `translate(${this.x}px, ${this.y}px`, 500);
  }

  tick() {
    if (this.el == null || this.isHit || this.timeout == 0) return;
    const timeoutEl = this.el.querySelector(".gwin-counter");
    if (this.timeout > 0)
    {
      this.timeout--;
      timeoutEl.innerText = this.timeout;
      if (this. timeout <= 5)
        timeoutEl.classList.add("red");
      else if (this.timeout <= 10)
        timeoutEl.classList.add("orange");
    }
  }

  kill() {
    var node = this.el;
    var section = this.section;
    setTimeout(()=>section.removeChild(node), 1000);
    this.el = null;
  }

  setHilight(text) {
    this.el.querySelector(".gwin-text").innerHTML = text;
  }

  hit() {
    if (this.isHit) return;
    this.el.classList.add("gwin-hit");
    this.points =  parseInt(this.el.querySelector(".gwin-counter").innerText);
    this.isHit = true;
  }
}