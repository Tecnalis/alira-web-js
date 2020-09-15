class Validator{
	static length(value, min, max){
		return value.length >= min && value.length <= max;
	}

	static charsByType(value, charType, min = 0, max = 1000){
		let matches = [];
		switch(charType){
			case 'number':
				matches = value.match(/[0-9]/gi);
				break;
			case 'uppercase':
				matches = value.match(/[A-Z]/gi);
				break;
			case 'lowercase':
				matches = value.match(/[a-z]/gi);
				break;
			case 'other':
				matches = value.match(/[@%+!#$^?_-]/gi);
				break;
			case 'space':
				matches = value.match(/[ ]/gi);
				break;
			default:
				console.warn(`No type ${charType} found in Validator.charsByType`);
				return false;
		}
		return matches.length >= min && matches.length <= max;
	}

	static initialType(value, charType, isOfType = true){
		if (value.length == 0){
			return false;
		}
		let isCharType = false;
		switch(charType){
			case 'number':
				isCharType = value.charAt(0).match(/[0-9]/gi);
				break;
			case 'uppercase':
				isCharType =  value.charAt(0).match(/[A-Z]/gi);
				break;
			case 'lowercase':
				isCharType =  value.charAt(0).match(/[a-z]/gi);
				break;
			case 'other':
				isCharType =  value.charAt(0).match(/[@%+!#$^?_-]/gi);
				break;
			case 'space':
				isCharType =  value.charAt(0).match(/[ ]/gi);
				break;
			default:
				console.warn(`No type ${charType} found in Validator.initialType`);
				return false;
		}
		if (isOfType){
			return isCharType;
		}else{
			return !isCharType;
		}
	}

	static isEqualTo(value1, value2){
		return value1 == value2;
	}

	static isEmail(value){
		let pattern = new RegExp(/^\S+[\w-\.]{1,}@([\w-]{1,}\.)*([\w-]{1,}\.)[\w-]{2,4}\S+$/);
		return pattern.test(value);
	}

	static isChecked(value){
		return value;
	}
	
	static checkField(value, testsArray){
		// Returns boolean array with tests results. Position 0 in the array is the overall result. 
		let results = [true];
		testsArray.forEach(test => {
			switch (test.type){
				case 'length':
					results.push(Validator.length(value, test.min, test.max));
					break;
				case 'chars':
					results.push(Validator.charsByType(value, test.charType, test.min, test.max));
					break;
				case 'isEmail':
					results.push(Validator.isEmail);
					break;
				case 'checkAliasExists':
					results.push(Validator.checkAliasExists(value));
					break;
				case 'initType':
					results.push(Validator.initialType(value, test.charType, test.isOfChar));
					break;
				default:
					console.warn(`No test type ${test.type} found in Validator.checkField`);
					results.push(false);
			}
			results[0] = results[0] && results[results.length - 1];
		});
		return results;
	}

	static addObserver(field, testsArray, config){
		let eventType = config.event || 'blur';
		let newObserver = {};
		newObserver.testsArray = testsArray;
		newObserver.config = config;
		field.addEventListener(eventType, function(){
			let results = Validator.checkField(field.value, testsArray);
			if(config.input){
				if (results[0]){
					field.classList.remove(config.input.failClass);
					field.classList.add(config.input.successClass);
				}else{
					field.classList.add(config.input.failClass);
					field.classList.remove(config.input.successClass);
				}
			}
			if(config.messages){
				let numResults = results.length;
				let messages = document.querySelectorAll(config.messages.selector);
				for (let i = 1; i < numResults; i++){
					if (messages.length >= i){
						let messageUI = messages[i - 1];
						if (results[i]){
							messageUI.classList.remove(config.messages.failClass);
							messageUI.classList.add(config.messages.successClass);
						}else{
							messageUI.classList.add(config.messages.failClass);
							messageUI.classList.remove(config.messages.successClass);
						}
					}else{
						break;
					}
				}
			}
		});
	}
}