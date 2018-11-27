import { IndexedObj } from "./types";

type Class = new(...args: any[]) => any;

export default class MixinBuilder {

	constructor(public SuperClass: Class) {}

	/**
	 * Add mixins
	 * @param mixins Mixins to mix in
	 */
	with(...mixins: any[]): Class {
		return mixins.reduce((Class, mixin) => mixin(Class), this.SuperClass);
	}

	/**
	 * Call this to start mixing your class
	 * @param SuperClass The parent class
	 */
	static mix(SuperClass: Class) {
		return new MixinBuilder(SuperClass);
	}

	/**
	 * Converts a regular class to a mixin
	 *
	 * This is for classes you don't have any control over.
	 * For your own, just make them mixins to start with.
	 * @param Class The class to mixinify
	 */
	static mixinify(Class: Class) {
		return (SuperClass: Class) => MixinBuilder.mergeProto(class Mixin extends SuperClass {

			constructor(superClassArgs: any[], mixinArgs: any[]) {
				super(...superClassArgs);
				Object.defineProperties(this, Object.getOwnPropertyDescriptors(new Class(...mixinArgs)));
			}

		}, Class);
	}

	static mergeProto({ prototype: classProto }: any, { prototype: superClassProto }: any): Class {
		const descriptorsToDefine = {} as IndexedObj<PropertyDescriptor>;
		for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(superClassProto))) {
			if (typeof classProto[key] === 'undefined') descriptorsToDefine[key] = descriptor;
		}
		return Object.defineProperties(classProto, descriptorsToDefine).constructor;
	}

}

export const { mix, mixinify } = MixinBuilder;
