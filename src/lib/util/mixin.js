class MixinBuilder {

	constructor(SuperClass) {
		this.SuperClass = SuperClass;
	}

	/**
	 * Add mixins
	 * @param  {...*} mixins Mixins to mix in
	 * @returns {function(new:Function, ...*)}
	 */
	with(...mixins) {
		return mixins.reduce((Class, mixin) => mixin(Class), this.SuperClass);
	}

	/**
	 * Call this to start mixing your class
	 * @param {function(new:Function, ...*)} SuperClass The parent class
	 * @returns {MixinBuilder}
	 */
	static mix(SuperClass) {
		return new MixinBuilder(SuperClass);
	}

	/**
	 * Converts a regular class to a mixin
	 *
	 * This is for classes you don't have any control over.
	 * For your own, just make them mixins to start with.
	 * @param {function(new:Function, ...*)} Class The class to mixinify
	 * @returns {function(new:Function, ...*): function(new:Function, ...*)}
	 */
	static mixinify(Class) {
		return SuperClass => MixinBuilder.mergeProto(class Mixin extends SuperClass {

			constructor(superClassArgs, mixinArgs) {
				super(...superClassArgs);
				Object.defineProperties(this, Object.getOwnPropertyDescriptors(new Class(...mixinArgs)));
			}

		}, Class);
	}

	static mergeProto({ prototype: classProto }, { prototype: superClassProto }) {
		const descriptorsToDefine = {};
		for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(superClassProto))) {
			if (typeof classProto[key] === 'undefined') descriptorsToDefine[key] = descriptor;
		}
		return Object.defineProperties(classProto, descriptorsToDefine).constructor;
	}

}

module.exports = MixinBuilder;
