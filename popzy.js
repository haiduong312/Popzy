Popzy.elements = [];

Popzy.prototype._getScrollBarWidth = function () {
  if (this._scrollBarWidth) return this._scrollBarWidth;

  const div = document.createElement("div");

  Object.assign(div.style, {
    overflow: "scroll",
    position: "absolute",
    top: "-9999px",
  });
  document.body.appendChild(div);

  this._scrollBarWidth = div.offsetWidth - div.clientWidth;

  document.body.removeChild(div);

  return this._scrollBarWidth;
};

Popzy.prototype._build = function () {
  const content = this.template.content.cloneNode(true);

  this._backdrop = document.createElement("div");
  this._backdrop.className = "popzy__backdrop";

  const container = document.createElement("div");
  container.className = "popzy__container";

  this.opt.cssClass.forEach((className) => {
    if (typeof className === "string") {
      container.classList.add(className);
    }
  });

  if (this._allowButtonClose) {
    // const closeBtn = document.createElement("button");
    // closeBtn.className = "popzy__close";
    // closeBtn.innerHTML = "&times;";
    // closeBtn.onclick = () => this.close();

    const closeBtn = this._createButton(
      "&times;",
      "popzy__close",
      this.close.bind(this)
    );

    container.append(closeBtn);
  }

  const modalContent = document.createElement("div");
  modalContent.className = "popzy__content";

  // Append content and elements
  modalContent.append(content);
  container.append(modalContent);

  if (this.opt.footer) {
    this._modalFooter = document.createElement("div");
    this._modalFooter.className = "popzy__footer";

    if (this._footerContent) {
      this._modalFooter.innerHTML = this._footerContent;
    }
    this._renderFooterButtons();
    container.append(this._modalFooter);
  }

  this._backdrop.append(container);
  document.body.append(this._backdrop);
};

Popzy.prototype.setFooterContent = function (html) {
  this._footerContent = html;
  if (this._modalFooter) {
    this._modalFooter.innerHTML = html;
  }
};

Popzy.prototype.addFooterButton = function (title, cssClass, callback) {
  // const button = document.createElement("button");
  // button.className = cssClass;
  // button.innerHTML = title;
  // button.onclick = callback;
  const button = this._createButton(title, cssClass, callback);
  this._footerButtons.push(button);
  this._renderFooterButtons();
};

Popzy.prototype._renderFooterButtons = function () {
  if (this._modalFooter) {
    this._footerButtons.forEach((button) => {
      this._modalFooter.append(button);
    });
  }
};

Popzy.prototype._createButton = function (title, cssClass, callback) {
  const button = document.createElement("button");
  button.className = cssClass;
  button.innerHTML = title;
  button.onclick = callback;
  return button;
};

// Create modal elements
Popzy.prototype.open = function () {
  Popzy.elements.push(this);
  if (!this._backdrop) {
    this._build();
  }

  setTimeout(() => {
    this._backdrop.classList.add("popzy--show");
  }, 0);

  if (this._allowBackdropClose) {
    this._backdrop.onclick = (e) => {
      if (e.target === this._backdrop) {
        this.close();
      }
    };
  }

  if (this._allowEscapeClose) {
    document.addEventListener("keydown", this._handleEscapeKey.bind(this));
  }

  document.body.classList.add("popzy--no-scroll");
  document.body.paddingRight = this._getScrollBarWidth() + "px";

  this._onTransitionEnd(() => {
    if (typeof this.opt.onOpen === "function") this.opt.onOpen();
  });

  return this._backdrop;
};

Popzy.prototype._handleEscapeKey = function (e) {
  const lastModal = Popzy.elements[Popzy.elements.length - 1];
  if (e.key === "Escape" && this === lastModal) {
    this.close();
  }
};

Popzy.prototype._onTransitionEnd = function (callback) {
  this._backdrop.ontransitionend = (e) => {
    if (e.propertyName !== "transform") return;
    // if (typeof onOpen === "function") onOpen();
    if (typeof callback === "function") callback();
  };
};

Popzy.prototype.close = function (destroy = this.opt.destroyOnClose) {
  Popzy.elements.pop();
  this._backdrop.classList.remove("popzy--show");

  if (this._allowEscapeClose) {
    document.removeEventListener("keydown", this._handleEscapeKey);
  }

  this._onTransitionEnd(() => {
    if (this._backdrop && destroy) {
      this._backdrop.remove();
      this._backdrop = null;
      this._modalFooter = null;
    }
    if (!Popzy.elements.length) {
      document.body.classList.remove("popzy--no-scroll");
      document.body.style.paddingRight = "";
    }
    if (typeof this.opt.onClose === "function") this.opt.onClose();
  });
};
this.destroy = () => {
  this.close(true);
};

function Popzy(options = {}) {
  this._footerButtons = [];
  this.opt = Object.assign(
    {
      footer: false,
      cssClass: [],
      destroyOnClose: true,
      closeMethods: ["button", "overlay", "Escape"],
    },
    options
  );
  this.template = document.querySelector(`#${this.opt.templateId}`);

  if (!this.template) {
    console.error("error");
    return;
  }
  const { closeMethods } = this.opt;
  this._allowButtonClose = closeMethods.includes("button");
  this._allowBackdropClose = closeMethods.includes("overlay");
  this._allowEscapeClose = closeMethods.includes("Escape");
}
