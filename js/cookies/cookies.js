class Cookies{
	static create(name, value, days = 1, adjustMidnight = false) {
		let expires = '';
		if (days) {
			let date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			if (adjustMidnight){
				date.setHours(0, 0, 0, 0);
			}
			expires = "; expires=" + date.toGMTString();
		}
		document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
	}
	
	static read(name) {
		let nameEQ = escape(name) + "=";
		let cookieArray = document.cookie.split(';');
		for (let i = 0; i < cookieArray.length; i++) {
			let cookieParam = cookieArray[i].trim();
			if (cookieParam.indexOf(nameEQ) == 0){
				return unescape(cookieParam.substring(nameEQ.length, cookieParam.length));
			}	
		}
		return null;
	}
	
	static delete(name) {
		createCookie(name, "", -1);
	}
}