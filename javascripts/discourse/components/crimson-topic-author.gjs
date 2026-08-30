import Component from "@glimmer/component";
import avatar from "discourse/helpers/avatar";

export default class CrimsonTopicAuthor extends Component {
  get topic() {
    return this.args.topic || this.args.outletArgs?.topic;
  }

  <template>
    <td
      class="cn-topic-author topic-list-data"
      style="width:58px;min-width:58px;max-width:58px;vertical-align:top;"
    >
      {{#if this.topic.creator}}
        <a
          class="cn-topic-author__link"
          href={{this.topic.creator.path}}
          data-user-card={{this.topic.creator.username}}
          aria-label={{this.topic.creator.username}}
        >
          {{avatar this.topic.creator imageSize="40"}}
        </a>
      {{/if}}
    </td>
  </template>
}
