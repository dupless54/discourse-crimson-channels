import { i18n } from "discourse-i18n";

const CrimsonTopicAuthorHeader = <template>
  <th class="cn-topic-author-header topic-list-data" scope="col">
    {{#unless @bulkSelectEnabled}}
      <span class="cn-topic-author-header__label">
        {{i18n (themePrefix "topic_author")}}
      </span>
    {{/unless}}
  </th>
</template>;

export default CrimsonTopicAuthorHeader;
