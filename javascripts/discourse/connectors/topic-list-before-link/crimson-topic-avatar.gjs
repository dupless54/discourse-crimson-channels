import Component from "@glimmer/component";
import { service } from "@ember/service";
import DUserLink from "discourse/ui-kit/d-user-link";
import dAvatar from "discourse/ui-kit/helpers/d-avatar";

// Adds the premium topic-list author avatar without replacing or copying
// core's TopicCell. Fires inside the native `<td class="main-link
// topic-list-data">`, before `.link-top-line`; stylesheets/crimson-topic-list.scss
// turns that `<td>` into an avatar + content grid using this element and the
// unmodified native children. Core also renders this same outlet in its
// mobile-layout branch (which already has its own `.pull-left` avatar), so
// this stays inert there to avoid a duplicate.
export default class CrimsonTopicAvatar extends Component {
  @service site;

  get author() {
    const topic = this.args.outletArgs.topic;
    return topic.creator || topic.lastPosterUser;
  }

  <template>
    {{#unless this.site.mobileView}}
      {{#if this.author}}
        <DUserLink
          @username={{this.author.username}}
          @ariaLabel={{this.author.username}}
          class="cn-topic-cell__author"
        >
          {{dAvatar this.author imageSize="medium"}}
        </DUserLink>
      {{/if}}
    {{/unless}}
  </template>
}
