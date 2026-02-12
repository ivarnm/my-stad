"use client";

import React, { useMemo } from "react";
import { Group } from "@visx/group";
import { AreaClosed, LinePath } from "@visx/shape";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { LinearGradient } from "@visx/gradient";
import { curveMonotoneX } from "@visx/curve";
import { ParentSize } from "@visx/responsive";
import { GridRows } from "@visx/grid";
import { NowWeather } from "src/server/actions/weather/types";

// Accessors
const getDate = (d: { time: Date }) => new Date(d.time);
const getValue = (d: { precipitationRate: number }) => d.precipitationRate;

export type PrecipitationChartProps = {
  data: NonNullable<NowWeather["timeseries"]>;
  width: number;
  height: number;
};

function Chart({ data, width, height }: PrecipitationChartProps) {
  // Margins
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const showLine = data.some((d) => getValue(d) > 0);

  // Filter data to next 90 minutes
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    const startTime = getDate(data[0]).getTime();
    const endTime = startTime + 90 * 60 * 1000;
    return data.filter((d) => {
      const t = getDate(d).getTime();
      return t >= startTime && t <= endTime;
    });
  }, [data]);

  // Scales
  const xScale = useMemo(
    () =>
      scaleTime({
        range: [0, xMax],
        domain: [
          getDate(chartData[0]),
          new Date(getDate(chartData[0]).getTime() + 90 * 60 * 1000),
        ],
      }),
    [xMax, chartData]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [0, 2.0],
      }),
    [yMax]
  );

  if (width < 10) return null;

  const startTime = getDate(chartData[0]).getTime();
  const tickValues = [
    new Date(startTime),
    new Date(startTime + 30 * 60 * 1000),
    new Date(startTime + 60 * 60 * 1000),
    new Date(startTime + 90 * 60 * 1000),
  ];

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <LinearGradient
            id="rain-gradient"
            from="#60a5fa"
            to="#60a5fa"
            fromOpacity={0.5}
            toOpacity={0}
            x1={0}
            y1={0}
            x2={0}
            y2={yMax}
            gradientUnits="userSpaceOnUse"
          />
          <GridRows
            scale={yScale}
            width={xMax}
            tickValues={[0.5, 1.0, 2.0]}
            stroke="var(--surface-muted)"
            strokeDasharray="3,3"
          />

          <AxisBottom
            top={yMax}
            scale={xScale}
            tickValues={tickValues}
            tickFormat={(val, i) => {
              if (i === 0) return "Now";
              if (i === 1) return "30";
              if (i === 2) return "60";
              if (i === 3) return "90";
              return "";
            }}
            stroke="transparent"
            tickStroke="transparent"
            tickLabelProps={() => ({
              fill: "var(--text-subtle)",
              fontSize: 11,
              textAnchor: "middle",
            })}
          />

          <AxisLeft
            scale={yScale}
            tickValues={[0.5, 1.0, 2.0]}
            tickFormat={(val) => {
              if (val === 2.0) return "100%";
              if (val === 1.0) return "50%";
              if (val === 0.5) return "25%";
              return "";
            }}
            stroke="transparent"
            tickStroke="transparent"
            tickLabelProps={() => ({
              fill: "var(--text-subtle)",
              fontSize: 11,
              textAnchor: "end",
              dx: -5,
              dy: 2.5,
            })}
          />

          <AreaClosed
            data={chartData}
            x={(d) => xScale(getDate(d)) ?? 0}
            y={(d) => yScale(getValue(d)) ?? 0}
            yScale={yScale}
            strokeWidth={0}
            fill="url(#rain-gradient)"
            curve={curveMonotoneX}
          />

          <LinePath
            data={chartData}
            x={(d) => xScale(getDate(d)) ?? 0}
            y={(d) => yScale(getValue(d)) ?? 0}
            stroke="#ffffff"
            strokeWidth={showLine ? 2 : 0}
            curve={curveMonotoneX}
          />
        </Group>
      </svg>
    </div>
  );
}

export default function PrecipitationChart({
  timeseries,
}: {
  timeseries: NowWeather["timeseries"];
}) {
  if (!timeseries || timeseries.length === 0) return null;

  return (
    <div className="w-full h-[150px]">
      <ParentSize>
        {({ width, height }) => (
          <Chart data={timeseries} width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
}
