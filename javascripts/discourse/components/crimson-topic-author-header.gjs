import { i18n } from "discourse-i18n";

const CrimsonTopicAuthorHeader = <template>
  <th
    class="cn-topic-author-header topic-list-data"
    scope="col"
    style="width:58px;min-width:58px;max-width:58px;"
  >
    {{#unless @bulkSelectEnabled}}
      <span class="cn-topic-author-header__label">
        {{i18n (themePrefix "topic_author")}}
      </span>
    {{/unless}}
  </th>
</template>;

export default CrimsonTopicAuthorHeader;
