import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  api.registerValueTransformer("topic-list-columns", ({ value: columns }) => {
    // Keep the native "topic" column (TopicCell) and its markup entirely
    // intact — the avatar is injected via the topic-list-before-link outlet
    // (see connectors/topic-list-before-link/crimson-topic-avatar.gjs) and
    // laid out with CSS instead of a copied/replaced column item. Only drop
    // the optional poster stack, which the avatar makes redundant; this is
    // the supported use of this transformer per the topic-list customization
    // guide ("topic-list-columns transformer is appropriate for column
    // changes").
    columns.delete("posters");
  });
});
