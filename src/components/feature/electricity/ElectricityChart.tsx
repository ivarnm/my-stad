"use client";

import React, { useMemo, useCallback } from "react";
import { Group } from "@visx/group";
import { LinePath, Bar, Line } from "@visx/shape";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { LinearGradient } from "@visx/gradient";
import { curveMonotoneX } from "@visx/curve";
import { ParentSize } from "@visx/responsive";
import { GridRows } from "@visx/grid";
import { useTooltip, TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { bisector } from "d3-array";
import { HourlyElectricityPrice, ElectricityPrices } from "src/server/actions/electricity/types";

// Accessors
const getDate = (d: HourlyElectricityPrice) => new Date(d.time);
const getPrice = (d: HourlyElectricityPrice) => d.pricePerKWh;
const getSubsidizedPrice = (d: HourlyElectricityPrice) => d.priceWithSubsidy;
const bisectDate = bisector<HourlyElectricityPrice, Date>((d) => new Date(d.time)).left;

export type ElectricityChartProps = {
  data: HourlyElectricityPrice[];
  width: number;
  height: number;
};

function ElectricityChart({ data, width, height }: ElectricityChartProps) {
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<HourlyElectricityPrice>();

  // Margins
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(
    () =>
      scaleTime({
        range: [0, xMax],
        domain: [
          Math.min(...data.map((d) => getDate(d).getTime())),
          Math.max(...data.map((d) => getDate(d).getTime())),
        ],
      }),
    [xMax, data]
  );

  const maxPrice = useMemo(
    () =>
      Math.max(
        ...data.map((d) => Math.max(getPrice(d), getSubsidizedPrice(d)))
      ) * 1.25,
    [data]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [0, maxPrice],
        nice: true,
      }),
    [yMax, maxPrice]
  );

  const currentDataPoint = useMemo(() => {
    const now = new Date();
    return data.find((d) => {
      const date = getDate(d);
      return (
        date.getDate() === now.getDate() &&
        date.getHours() === now.getHours() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }, [data]);

  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x - margin.left);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d =
          x0.valueOf() - getDate(d0).valueOf() >
            getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: xScale(getDate(d)),
        tooltipTop: yScale(getPrice(d)),
      });
    },
    [showTooltip, yScale, xScale, data, margin.left]
  );

  if (width < 10) return null;

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <LinearGradient
          id="line-gradient"
          from="#22c55e" // green-500
          to="#ef4444" // red-500
          x1={0}
          y1={yScale(0)}
          x2={0}
          y2={yScale(1.0)}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </LinearGradient>

        <Group left={margin.left} top={margin.top}>
          {/* Grid Lines */}
          <GridRows
            scale={yScale}
            width={xMax}
            strokeDasharray="3,3"
            stroke="var(--surface-muted)"
            strokeWidth={1}
            numTicks={5}
          />

          {/* Axes */}
          <AxisBottom
            top={yMax}
            scale={xScale}
            tickValues={data
              .map((d) => getDate(d))
              .filter((date) => date.getHours() % 4 === 0)}
            stroke="transparent"
            tickStroke="transparent"
            tickFormat={(val) => {
              const date = val instanceof Date ? val : new Date(val.valueOf());
              return String(date.getHours()).padStart(2, "0");
            }}
            tickLabelProps={() => ({
              fill: "var(--text-subtle)",
              fontSize: 11,
              textAnchor: "middle",
            })}
          />
          <AxisLeft
            scale={yScale}
            numTicks={5}
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

          {/* Subsidized Price Line (Dashed) */}
          <LinePath<HourlyElectricityPrice>
            data={data}
            x={(d) => xScale(getDate(d)) ?? 0}
            y={(d) => yScale(getSubsidizedPrice(d)) ?? 0}
            stroke="url(#line-gradient)"
            strokeWidth={2}
            strokeOpacity={0.6}
            strokeDasharray="5,5"
            curve={curveMonotoneX}
          />

          {/* Spot Price Line (Solid) */}
          <LinePath<HourlyElectricityPrice>
            data={data}
            x={(d) => xScale(getDate(d)) ?? 0}
            y={(d) => yScale(getPrice(d)) ?? 0}
            stroke="url(#line-gradient)"
            strokeWidth={3}
            curve={curveMonotoneX}
          />

          {/* Current Time Dot */}
          {currentDataPoint && (
            <circle
              cx={xScale(getDate(currentDataPoint)) ?? 0}
              cy={yScale(getPrice(currentDataPoint)) ?? 0}
              r={5}
              fill="var(--fill-default)"
            />
          )}

          {/* Tooltip Elements */}
          <Bar
            x={0}
            y={0}
            width={xMax}
            height={yMax}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />

          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: 0 }}
                to={{ x: tooltipLeft, y: yMax }}
                stroke="var(--text-subtle)"
                strokeWidth={1}
                pointerEvents="none"
                strokeDasharray="5,5"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={5}
                fill="var(--fill-default)"
                pointerEvents="none"
              />
            </g>
          )}
        </Group>
      </svg>
      {tooltipData && (
        <TooltipWithBounds
          top={tooltipTop + margin.top}
          left={tooltipLeft + margin.left}
          style={{
            ...defaultStyles,
            background: "var(--surface-muted)",
            color: "var(--foreground)",
            border: "1px solid var(--text-subtle)",
            borderRadius: "8px",
            padding: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="text-center">
            <div className="font-bold mb-1">
              Kl. {getDate(tooltipData).getHours().toString().padStart(2, '0')}-
              {(getDate(tooltipData).getHours() + 1).toString().padStart(2, '0')}
            </div>
            <div>
              {getPrice(tooltipData).toFixed(2).replace('.', ',')} kr
            </div>
            {tooltipData.priceWithSubsidy !== tooltipData.pricePerKWh && (
              <div>
                {getSubsidizedPrice(tooltipData).toFixed(2).replace('.', ',')} kr with subsidy
              </div>
            )}
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}

export default function ResponsiveElectricityChart({
  data,
}: {
  data: ElectricityPrices;
}) {
  const chartData = useMemo(() => {
    if (data.tomorrow && data.tomorrow.length > 0) {
      const todayFrom16 = data.today.filter((d) => new Date(d.time).getHours() >= 16);
      return [...todayFrom16, ...data.tomorrow];
    }
    return data.today;
  }, [data]);

  return (
    <div className="w-full h-[200px]">
      <ParentSize>
        {({ width, height }) => (
          <ElectricityChart data={chartData} width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
}
