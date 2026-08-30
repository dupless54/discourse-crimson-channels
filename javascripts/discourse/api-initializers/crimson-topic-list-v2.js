import { apiInitializer } from "discourse/lib/api";
import CrimsonTopicCell from "../components/crimson-topic-cell";

export default apiInitializer((api) => {
  api.registerValueTransformer("topic-list-columns", ({ value: columns }) => {
    // Keep the core table model and sorting cells intact. We only replace the
    // topic cell and remove the optional poster stack so the row stays compact.
    columns.delete("crimson-topic-author");
    columns.delete("posters");
    columns.replace("topic", { item: CrimsonTopicCell });
  });
});
