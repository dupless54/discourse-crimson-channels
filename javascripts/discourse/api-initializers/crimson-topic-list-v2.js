import { apiInitializer } from "discourse/lib/api";
import CrimsonTopicAuthor from "../components/crimson-topic-author";
import CrimsonTopicAuthorHeader from "../components/crimson-topic-author-header";

export default apiInitializer((api) => {
  api.registerValueTransformer("topic-list-columns", ({ value: columns }) => {
    const site = api.container.lookup("service:site");

    if (site?.mobileView) {
      return columns;
    }

    columns.add(
      "crimson-topic-author",
      {
        item: CrimsonTopicAuthor,
        header: CrimsonTopicAuthorHeader,
      },
      { before: "topic" }
    );

    return columns;
  });
});
