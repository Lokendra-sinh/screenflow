import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import { Clock, Monitor, Globe, Activity } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";

const TimeDistribution = ({ timeData }) => {
  // If no data is provided, use sample data
  const data = timeData || {
    byApp: [
      {
        app: "Visual Studio Code",
        percentage: 43,
        totalDuration: 45000,
      },
      {
        app: "Google Chrome",
        percentage: 57,
        totalDuration: 60000,
      },
    ],
    byDomain: [
      {
        domain: "localhost:3000",
        percentage: 10,
        totalDuration: 10000,
      },
      {
        domain: "x.com",
        percentage: 47,
        totalDuration: 50000,
      },
    ],
    byType: [
      {
        percentage: 43,
        totalDuration: 45000,
        type: "technical-documentation",
      },
      {
        percentage: 57,
        totalDuration: 60000,
        type: "social-media",
      },
    ],
  };

  // Format durations from milliseconds to minutes and seconds
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Midnight theme chart colors
  const chartColors = {
    chart1: "hsl(var(--chart-1))",
    chart2: "hsl(var(--chart-2))",
    chart3: "hsl(var(--chart-3))",
    chart4: "hsl(var(--chart-4))",
    chart5: "hsl(var(--chart-5))",
  };

  // Determine color based on activity type
  const getActivityColor = (type, index) => {
    if (type === "technical-documentation") return chartColors.chart1;
    if (type === "social-media") return chartColors.chart2;
    return chartColors[`chart${(index % 5) + 1}`];
  };

  // Generate data for the pie charts
  const prepareDataForPieChart = (data, nameKey) => {
    return data.map((item, index) => ({
      name: item[nameKey],
      value: item.percentage,
      duration: formatDuration(item.totalDuration),
      fill: chartColors[`chart${(index % 5) + 1}`],
    }));
  };

  const appData = prepareDataForPieChart(data.byApp, "app");
  const domainData = prepareDataForPieChart(data.byDomain, "domain");
  const typeData = prepareDataForPieChart(data.byType, "type");

  // Create chart config for shadcn/ui chart container
  const createChartConfig = (data, nameKey) => {
    return data.reduce((config, item, index) => {
      config[item[nameKey]] = {
        label: item[nameKey],
        color: chartColors[`chart${(index % 5) + 1}`],
      };
      return config;
    }, {});
  };

  const appChartConfig = createChartConfig(data.byApp, "app");
  const domainChartConfig = createChartConfig(data.byDomain, "domain");
  const typeChartConfig = createChartConfig(data.byType, "type");


  const SimpleTimeBar = ({ data, nameKey, colorKey = "type" }) => {
    return (
      <div className="mt-6">
        {data.map((item, index) => (
          <div key={index} className="mb-6">
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: getActivityColor(item[colorKey], index),
                  }}
                ></div>
                <span className="font-medium">{item[nameKey]}</span>
              </div>
              <span className="font-bold">{item.percentage}%</span>
            </div>
            <div className="relative h-6 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: getActivityColor(item[colorKey], index),
                }}
              ></div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-medium text-foreground">
                {formatDuration(item.totalDuration)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full p-6 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">How You Spent Your Time</h2>
        <p className="text-muted-foreground">
          Clear breakdown of your time across apps, websites, and activities
        </p>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="visual" className="flex-1">
            Visual View
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex-1">
            Detailed View
          </TabsTrigger>
        </TabsList>

        {/* Simple Visual View - For quick understanding */}
        <TabsContent value="visual" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" /> Activity Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="h-12 rounded-lg bg-muted relative overflow-hidden">
                    {data.byType.map((item, index, arr) => {
                      // Calculate width percentage
                      const width = item.percentage;

                      // Calculate left position based on previous items
                      let leftPosition = 0;
                      for (let i = 0; i < index; i++) {
                        leftPosition += arr[i].percentage;
                      }

                      return (
                        <div
                          key={index}
                          className="absolute top-0 h-full flex items-center justify-center"
                          style={{
                            width: `${width}%`,
                            left: `${leftPosition}%`,
                            backgroundColor:
                              chartColors[`chart${(index % 5) + 1}`],
                          }}
                        >
                          <span className="text-card font-bold text-sm px-2 whitespace-nowrap">
                            {item.percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex justify-between">
                    {data.byType.map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="flex items-center mb-1">
                          <div
                            className="w-3 h-3 rounded-full mr-1"
                            style={{
                              backgroundColor:
                                chartColors[`chart${(index % 5) + 1}`],
                            }}
                          ></div>
                          <span className="text-sm font-medium capitalize">
                            {item.type.replace(/-/g, " ")}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(item.totalDuration)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium flex items-center mb-4">
                    <Monitor className="mr-2 h-5 w-5" /> Applications
                  </h3>
                  <SimpleTimeBar
                    data={data.byApp}
                    nameKey="app"
                    colorKey="app"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium flex items-center mb-4">
                    <Globe className="mr-2 h-5 w-5" /> Websites
                  </h3>
                  <SimpleTimeBar
                    data={data.byDomain}
                    nameKey="domain"
                    colorKey="domain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Comparison Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" /> Time Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.byApp.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">{item.app}</h4>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold">
                        {item.percentage}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(item.totalDuration)}
                      </div>
                    </div>

                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor:
                            chartColors[`chart${(index % 5) + 1}`],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}

                {data.byDomain.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">{item.domain}</h4>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold">
                        {item.percentage}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(item.totalDuration)}
                      </div>
                    </div>

                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor:
                            chartColors[`chart${(index % 5) + 1}`],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed View - For more information */}
        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Applications */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Monitor className="mr-2 h-5 w-5" /> Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ChartContainer config={appChartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {appData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={(props) => {
                            const { active, payload } = props;
                            if (active && payload && payload.length) {
                              return (
                                <div className="p-2 bg-card border border-border rounded-md shadow-sm">
                                  <p className="font-medium">
                                    {payload[0].name}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {payload[0].payload.duration}
                                  </p>
                                  <p className="font-bold">
                                    {payload[0].value}% of time
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-4">
                  {data.byApp.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center mb-2"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              chartColors[`chart${(index % 5) + 1}`],
                          }}
                        ></div>
                        <span className="text-sm">{item.app}</span>
                      </div>
                      <span className="font-medium">
                        {formatDuration(item.totalDuration)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Domains/Websites */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" /> Websites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ChartContainer config={domainChartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={domainData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {domainData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={(props) => {
                            const { active, payload } = props;
                            if (active && payload && payload.length) {
                              return (
                                <div className="p-2 bg-card border border-border rounded-md shadow-sm">
                                  <p className="font-medium">
                                    {payload[0].name}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {payload[0].payload.duration}
                                  </p>
                                  <p className="font-bold">
                                    {payload[0].value}% of time
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-4">
                  {data.byDomain.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center mb-2"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              chartColors[`chart${(index % 5) + 1}`],
                          }}
                        ></div>
                        <span className="text-sm">{item.domain}</span>
                      </div>
                      <span className="font-medium">
                        {formatDuration(item.totalDuration)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Activity Type */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" /> Activity Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ChartContainer config={typeChartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ percent }) =>
                            `${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={(props) => {
                            const { active, payload } = props;
                            if (active && payload && payload.length) {
                              return (
                                <div className="p-2 bg-card border border-border rounded-md shadow-sm">
                                  <p className="font-medium">
                                    {payload[0].name}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {payload[0].payload.duration}
                                  </p>
                                  <p className="font-bold">
                                    {payload[0].value}% of time
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="mt-4">
                  {data.byType.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center mb-2"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              chartColors[`chart${(index % 5) + 1}`],
                          }}
                        ></div>
                        <span className="text-sm capitalize">
                          {item.type.replace(/-/g, " ")}
                        </span>
                      </div>
                      <span className="font-medium">
                        {formatDuration(item.totalDuration)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart Comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Time Comparison</CardTitle>
              <CardDescription>
                Duration across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      ...data.byApp.map((item, index) => ({
                        name: item.app,
                        value: item.totalDuration / 1000 / 60, // Convert to minutes
                        category: "Applications",
                        percentage: item.percentage,
                        fill: chartColors[`chart${(index % 5) + 1}`],
                      })),
                      ...data.byDomain.map((item, index) => ({
                        name: item.domain,
                        value: item.totalDuration / 1000 / 60, // Convert to minutes
                        category: "Websites",
                        percentage: item.percentage,
                        fill: chartColors[`chart${((index + 2) % 5) + 1}`],
                      })),
                      ...data.byType.map((item, index) => ({
                        name: item.type.replace(/-/g, " "),
                        value: item.totalDuration / 1000 / 60, // Convert to minutes
                        category: "Activity Types",
                        percentage: item.percentage,
                        fill: chartColors[`chart${((index + 4) % 5) + 1}`],
                      })),
                    ]}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      scale="band"
                      axisLine={false}
                      tickLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} min (${props.payload.percentage}%)`,
                        "Time Spent",
                      ]}
                      labelFormatter={(value) => `${value}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--card-foreground))",
                      }}
                    />
                    <Bar dataKey="value" name="Minutes" radius={[4, 4, 0, 0]}>
                      {data.byApp
                        .concat(data.byDomain)
                        .concat(data.byType)
                        .map((entry, index) => {
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={chartColors[`chart${(index % 5) + 1}`]}
                            />
                          );
                        })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeDistribution;
