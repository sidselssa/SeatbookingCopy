import { Component, h } from "preact";

/*
 * Needed to be able to use Webpack's imports for loading styles
 */
declare var require: {
  <T>(path: string): T;
  (paths: string[], callback: (...modules: any[]) => void): void;
  ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

import OccupiedSeatPattern from "./occupiedSeatPattern";
import RowOfTables from "./rowOfTables";
import {┬áSeatSize } from "./seat";

export interface IRootComponentProps {
  canOverride: boolean;
  layout: number[];
  names?: string[];
  offsets?: number[];
  occupied: string[];
  selectedId: string;
  seatnames?: string[];
  onSeatSelected: (id: string) => void;
}

interface IRootComponentState {
  selectedId: string;
  rows: IRow[];

  maxWidth: number;
  maxHeight: number;
}

interface IRow {
  indexOffset: number;
  x: number;
  y: number;
  seatGroups: number;
  angle: number;
}

const styles = require("./root.css");
const seatStyles = require("./seatStyles.css");

export default class RootComponent extends Component<IRootComponentProps, IRootComponentState> {
  public state = {
    maxWidth: 0,
    maxHeight: 0,
    rows: [],
    selectedId: null
  };

  public componentWillMount() {
    this.updateRows(this.props);
  }

  public componentWillReceiveProps(newProps) {
    this.updateRows(newProps);
  }

  public updateRows(props) {
    const rows: IRow[] = [];

    const deltaAngle = 90 / (props.layout.length - 1);

    let maxHeight = 0;
    let maxWidth = 0;

    let indexOffset = 0;
    for (let i = 0; i < props.layout.length; i++) {
      let startRadius = props.offsets && Array.isArray(props.offsets) && props.offsets.length === props.layout.length
        ? Math.floor(SeatSize * (5 + props.offsets[i])) 
        : Math.floor(SeatSize * 5);

      const radAngle = (Math.PI / 180) * deltaAngle * i;

      maxWidth = Math.max(
        maxWidth,
        SeatSize
          + Math.sin(radAngle) * (startRadius + SeatSize * props.layout[i])
          + Math.cos(radAngle) * SeatSize
      );
      maxWidth = Math.max(
        maxWidth,
        SeatSize
          + Math.sin(radAngle) * (startRadius + SeatSize * props.layout[i])
          - Math.cos(radAngle) * SeatSize
      );

      maxHeight = Math.max(
        maxHeight,
        SeatSize
          + Math.cos(radAngle) * (startRadius + SeatSize * props.layout[i])
          - Math.sin(radAngle) * SeatSize
      );
      maxHeight = Math.max(
        maxHeight,
        SeatSize
          + Math.cos(radAngle) * (startRadius + SeatSize * props.layout[i])
          + Math.sin(radAngle) * SeatSize
      );

      rows.push({
        indexOffset,
        x: -SeatSize,
        y: startRadius,
        seatGroups: props.layout[i],
        angle: deltaAngle * i
      });
      indexOffset += props.layout[i] * 2;
    }
    this.setState({
      rows,
      selectedId: props.selectedId,
      maxWidth: Math.ceil(maxWidth),
      maxHeight: Math.ceil(maxHeight)
    });
  }

  public onSeatClicked = (id: string): void  => {
    this.setState({
      selectedId: id
    });
    this.props.onSeatSelected(id);
  }

  public render({ seatnames, names, layout, occupied, canOverride }: IRootComponentProps) {
    const Margin = 20;
    return (
      <div
        className="SEATBOOKING-root"
        style={`min-width: ${this.state.maxWidth}px; min-height: ${this.state.maxHeight}px`}
      >
        <style>{styles.toString()}</style>
        <svg width={this.state.maxWidth + Margin*2}┬áheight={this.state.maxHeight + Margin*2}>
          <defs>
            <OccupiedSeatPattern size={10} id="occupied"/>
          </defs>
          { seatnames && <text>{seatnames[this.state.selectedId]}</text> }
          <g transform={`translate(${Margin}, ${Margin})`}>
            <g transform={`translate(${SeatSize}, ${SeatSize})`}>
              {
                this.state.rows.map((el, index) => (
                  <RowOfTables
                    key={index.toString()}

                    name={names && names[index]}

                    canOverride={canOverride}

                    seatnames={seatnames}

                    occupied={occupied}
                    indexOffset={el.indexOffset}
                    originX={el.x}
                    originY={el.y}
                    angle={el.angle}
                    selectedId={this.state.selectedId}
                    onClick={this.onSeatClicked}
                    tableCount={el.seatGroups}
                  />
                ))
              }
            </g>
          </g>
          <style>{seatStyles.toString()}</style>
        </svg>
      </div>
    );
  }
}
