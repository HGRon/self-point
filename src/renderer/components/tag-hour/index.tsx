import React from 'react';
import { Time } from '../../helpers/time';
import { List } from '../../helpers/list';

interface TagHourProps {
  hours: string[];
}

function TagHour({ hours }: TagHourProps) {
  const time = new Time();
  const now = time.formatToBRformat(new Date());
  const list = new List();

  const tags = list.completeArray(hours)

  return (
    <div className="tags">
      <span>⏰ { now }</span>

      <div className="tags__container">
        { tags.map((c, i) => <p key={ i }>{ c }</p>) }
      </div>
    </div>
  );
}

export default TagHour;
