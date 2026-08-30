import Component from "@glimmer/component";
import avatar from "discourse/helpers/avatar";

export default class CrimsonTopicAuthor extends Component {
  get topic() {
    return this.args.topic || this.args.outletArgs?.topic;
  }

  <template>
    <td class="cn-topic-author topic-list-data">
      {{#if this.topic.creator}}
        <a
          class="cn-topic-author__link"
          href={{this.topic.creator.path}}
          data-user-card={{this.topic.creator.username}}
          aria-label={{this.topic.creator.username}}
        >
          {{avatar this.topic.creator imageSize="40"}}
          <span class="cn-topic-author__identity">
            {{this.topic.creator.username}}
          </span>
        </a>
      {{/if}}
    </td>
  </template>
}
