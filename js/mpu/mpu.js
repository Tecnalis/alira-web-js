class MPU{
	/*
		TEMPLATE NEEDS:
		- <template> tag with ID sent as "templateID".
		- MPU div that contains everything else, inside template tag (ID "mpuParent").
		- MPU close button (ID "mpuClose").
		- MPU content div (ID "mpuContent").
		- MPU loading div (ID "mpuLoading").

		OPTIONS:
		- canClose: true|false. If close button is shown. Default true.
		- cookieDays: positive integer. Number of days for the cookie. Default 0 (no cookie).
	*/

	#status_OPEN = "open";
	#status_LOADING = "loading";
	#status_CLOSED = "closed";
	#template;
	#parentDivID;
	#closeButtonID;
	#contentDivID;
	#loadingDivID;
	#queue = [];
	#status;
	#currentMPU;
	
	constructor(config = {}){
		let templateID = config.templateID || 'mpu';
		this.#template = document.getElementById(templateID);
		this.#parentDivID = config.parentDivID || 'mpuParent';
		this.#closeButtonID = config.closeButtonID || 'mpuClose';
		this.#contentDivID = config.contentDivID || 'mpuContent';
		this.#loadingDivID = config.loadingDivID || 'mpuLoading';
		this.#status = this.#status_CLOSED;
		return this;
	}

	add(url, canClose = true, cookieID = '', cookieDays = 0){
		this.#queue.push({url: url, canClose: canClose, cookieID: cookieID, cookieDays: cookieDays});
		if(this.#status == this.#status_CLOSED){
			this.openNext();
		}
	}

	async openNext(){
		let newElement = this.#queue[0];
		if (newElement.cookieID && newElement.cookieID != ''){
			try{	
				let cookieValue = Cookies.read(newElement.cookieID);
				if (cookieValue){
					this.#queue.shift();
					this.close();
					return false;
				}else{
					Cookies.create(newElement.cookieID, 'done', newElement.cookieDays);
				}
			}catch(error){
				console.error('Cookie could not be read. Cookie library not found. MPU not shown.');
				this.#queue.shift();
				this.close();
				return false;
			}
		}
		if (this.#status == this.#status_CLOSED){
			let mpu = document.createElement('div');
			let clone = document.importNode(this.#template.content, true);
			document.body.appendChild(clone);
			this.#currentMPU = document.getElementById(this.#parentDivID);
			this.mpuClose = document.getElementById(this.#closeButtonID);
			let ref = this;
			this.mpuClose.onclick = () => ref.close();
			this.mpuContent = document.getElementById(this.#contentDivID);
			this.mpuLoading = document.getElementById(this.#loadingDivID);
		}
		this.#status = this.#status_LOADING;
		if (newElement.canClose){
			this.mpuClose.style.display = 'block';
		}else{
			this.mpuClose.style.display = 'none';
		}

		let url = newElement.url;
		let response = await fetch(url);
		if (response.ok){
			let parser = new DOMParser();
			let body = await response.text();
			let doc = parser.parseFromString(body, 'text/html');
			this.mpuContent.innerHTML = "";
			this.mpuContent.appendChild(doc.body);
			this.mpuLoading.style.display = 'none';
		}else{
			console.error(`Error loading ${url} in MPU`);
			this.mpuClose();
		}
		this.#queue.shift();
		this.#status = this.#status_OPEN;
	}

	close(){
		let mpu = this.#currentMPU;
		if (this.#queue.length == 0){
			if(this.#status != this.#status_CLOSED){
				this.#status = this.#status_CLOSED;
				document.body.removeChild(mpu);
			}
		}else{
			this.mpuLoading.style.display = 'block';
			this.openNext();
		}
	}
}