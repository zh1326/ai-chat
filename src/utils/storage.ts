/**
 * window.localStorage 浏览器永久缓存
 * @method setItem 设置缓存
 * @method getItem 获取缓存
 * @method removeItem 移除缓存
 * @method clear 移除全部缓存
 */
export const Storage = {
	setItem<T>(key: string, value: T) {
		if (value === undefined) {
			return
		}
		window.localStorage.setItem(key, JSON.stringify(value))
	},
	getItem<T>(key: string) {
		const json = window.localStorage.getItem(key)
		try {
			if (json) {
				return JSON.parse(json) as T
			}
		} catch (err) {
			console.error('err', err)
			return null
		}
		return null
	},
	removeItem(key: string) {
		window.localStorage.removeItem(key)
	},
	clear() {
		window.localStorage.clear()
	}
}

/**
 * window.sessionStorage 浏览器临时缓存
 * @method setItem 设置缓存
 * @method getItem 获取缓存
 * @method removeItem 移除缓存
 * @method clear 移除全部缓存
 */
export const SessionStorage = {
	setItem<T>(key: string, value: T) {
		if (value === undefined) {
			return
		}
		window.sessionStorage.setItem(key, JSON.stringify(value))
	},
	getItem<T>(key: string) {
		try {
			const json = window.sessionStorage.getItem(key)
			if (json) {
				return JSON.parse(json) as T
			}
		} catch (err) {
			console.error('err', err)
			return null
		}
		return null
	},
	removeItem(key: string) {
		window.sessionStorage.removeItem(key)
	},
	clear() {
		window.sessionStorage.clear()
	}
}
