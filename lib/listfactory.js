/**
 * Factory for Zz.List
 * @contructor
 *
 * @param {Firebase} takes instance of firebase reference containing location
 * @param {Object} blueprint for the list
 *   modelFactory - innstance of the model factory
 *   type = [ rich_ref, plain_ref, object ]
 *   priority - {priorityProvider{ instance
 */
Zz.ListFactory = function(ref, blueprint) {
	this.ref = ref;
	if (Object.isArray(blueprint) && 
			blueprint[0] === 'list' && 
			typeof blueprint[1] === 'object' && 
			!Object.isArray(blueprint[1])) {
		this.blueprint = blueprint[1];
	} else if (typeof blueprint[1] === 'object' && !Object.isArray(blueprint[1])) {
		this.blueprint = blueprint;
	} else {
		throw "Invalid parameters in blueprint";
	}
	if (this.blueprint.modelFactory instanceof Zz.ModelFactory) throw "Invalid argument in ModelFactory";
	if (this.blueprint.priorityProvider instanceof Zz.PriorityProvider ) throw "Invalid argument in PriorityProvider";

	this.modelFactory = this.blueprint.modelFactory;
	this.priorityProvider = this.blueprint.priorityProvider;
};

/**
 * TODO
 * the only need for list factory is the case where
 * the data is stored under customID
 * e.g
 * comments/{user_id}/{AUTO_ID}/comment_data.json
 * however in this case we never need to load "a page" of comments/{user_ID}
 * in DB technically it is list of lists, but in reality we always have a direct link to inner list.
 *
 * TODO - can you think of different use case.
 * blog/{USERID}/{topic_ID}/{BLOG_AUTOID}/blog_content.json
 * not sure if this is the right way how I would do DB as it is impossible list thorugh blogs
 * outside topics.
 *
 * TODO - we can list of lists leave outside of this for the time
 */

/**
 * creates the Zz.List instance
 * 
 * @param {string} url relative to provided ref in factory
 * @param {object} blueprint for new objects which list should contain
 *
 * @returns {Zz.List} new instance
 */
Zz.ListFactory.prototype.create = function(){
	return;
};
