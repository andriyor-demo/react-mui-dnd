'use client';

import {Sortable, Props as SortableProps} from "@/app/Sortable";
import {verticalListSortingStrategy} from "@dnd-kit/sortable";


const props: Partial<SortableProps> = {
  strategy: verticalListSortingStrategy,
  itemCount: 50,
};

export default function Home() {
  return (
   <div> <Sortable {...props} handle  /></div>
  )
}
