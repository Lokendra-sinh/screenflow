import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  RadialBarChart, 
  RadialBar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Clock, Activity, Zap, BarChart2, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getActivityColor = (activity) => {
  const colors = {
    'code-review': '#22c55e',       // Green for coding
    'social-media': '#3b82f6',      // Blue for social media
    'default': '#6b7280'           // Gray default
  };
  return colors[activity] || colors.default;
};

const getIntensityColor = (intensity) => {
  // Green gradient from light to dark based on intensity
  if (intensity >= 80) return '#14532d'; // Dark green
  if (intensity >= 60) return '#16a34a'; // Medium green
  if (intensity >= 40) return '#4ade80'; // Light green
  return '#86efac'; // Very light green
};

const TimelineData = ({ timelineData }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Prepare data for charts
  const prepareChartData = () => {
    if (!timelineData) return { heatmapData: [], intensityData: [], timePointsData: [] };

    // Format heatmap data for charts
    const heatmapData = timelineData.activityHeatmap.map(slot => ({
      timeSlot: slot.timeSlot,
      intensity: slot.intensity,
      activity: slot.dominantActivity,
      switchFrequency: slot.switchFrequency,
      intensityColor: getIntensityColor(slot.intensity),
      activityColor: getActivityColor(slot.dominantActivity)
    }));

    // Format intensity curve data
    const intensityData = timelineData.intensityCurve.map(point => ({
      time: point.x / 60000, // Convert to minutes
      intensity: point.y,
      contextGroup: point.contextGroupId,
      productivityScore: point.productivityScore
    }));

    // Format time points data
    const timePointsData = timelineData.timePoints.map(point => ({
      time: formatTime(point.timestamp),
      timestamp: new Date(point.timestamp).getTime(),
      intensity: point.intensity,
      productivityScore: point.productivityScore,
      contextGroup: point.contextGroupId,
      eventType: point.eventType
    }));

    return { heatmapData, intensityData, timePointsData };
  };

  const { heatmapData, intensityData, timePointsData } = prepareChartData();

  // Calculate overall productivity metrics
  const calculateMetrics = () => {
    if (!timelineData || !timelineData.activityHeatmap || timelineData.activityHeatmap.length === 0) {
      return { averageIntensity: 0, averageProductivity: 0 };
    }

    const intensitySum = timelineData.activityHeatmap.reduce((sum, item) => sum + item.intensity, 0);
    const averageIntensity = intensitySum / timelineData.activityHeatmap.length;

    const productivitySum = timelineData.timePoints.reduce((sum, item) => sum + item.productivityScore, 0);
    const averageProductivity = productivitySum / timelineData.timePoints.length;

    return { averageIntensity, averageProductivity };
  };

  const { averageIntensity, averageProductivity } = calculateMetrics();

  // Create pie chart data for activity distribution
  const activityDistribution = heatmapData.reduce((acc, item) => {
    const existingItem = acc.find(a => a.name === item.activity);
    if (existingItem) {
      existingItem.value += 1;
    } else {
      acc.push({ name: item.activity, value: 1 });
    }
    return acc;
  }, []);

  // Convert intensity curve to area chart data
  const areaChartData = intensityData.map((point, index, array) => {
    // For the end point, create smoother transition
    if (index < array.length - 1) {
      const nextPoint = array[index + 1];
      const midTime = (point.time + nextPoint.time) / 2;
      
      return [
        { time: point.time, intensity: point.intensity, productivity: point.productivityScore },
        { time: midTime, intensity: (point.intensity + nextPoint.intensity) / 2, productivity: (point.productivityScore + nextPoint.productivityScore) / 2 }
      ];
    }
    return [{ time: point.time, intensity: point.intensity, productivity: point.productivityScore }];
  }).flat();

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Productivity Timeline</CardTitle>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Session: {timePointsData.length > 0 ? timePointsData[0].time : 'N/A'} - {timePointsData.length > 1 ? timePointsData[timePointsData.length - 1].time : 'N/A'}
            </Badge>
          </div>
          <CardDescription>
            Visualizing your productivity flow and activity patterns
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="intensity">Intensity</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Average Intensity</p>
                        <h3 className="text-2xl font-bold text-gray-900">{Math.round(averageIntensity)}%</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      {averageIntensity > 65 ? (
                        <div className="flex items-center text-emerald-600">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          <span className="text-sm">High focus session</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600">
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                          <span className="text-sm">Moderate focus</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Productivity Score</p>
                        <h3 className="text-2xl font-bold text-gray-900">{Math.round(averageProductivity)}/100</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      {averageProductivity > 70 ? (
                        <div className="flex items-center text-emerald-600">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          <span className="text-sm">Very productive</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-emerald-600">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          <span className="text-sm">Good productivity</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Context Switches</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {heatmapData.reduce((sum, item) => sum + item.switchFrequency, 0)}
                        </h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      {heatmapData.reduce((sum, item) => sum + item.switchFrequency, 0) < 2 ? (
                        <div className="flex items-center text-emerald-600">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          <span className="text-sm">Minimal interruptions</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600">
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                          <span className="text-sm">Some task switching</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Activity Flow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaChartData}>
                          <defs>
                            <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#16a34a" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="time" 
                            label={{ value: 'Minutes', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis domain={[0, 100]} />
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            formatter={(value) => [`${value}`, 'Intensity']}
                            labelFormatter={(time) => `Time: ${time} min`}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="intensity" 
                            stroke="#16a34a" 
                            fill="url(#intensityGradient)" 
                            strokeWidth={2}
                            isAnimationActive={true}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Activity Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activityDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={(entry) => entry.name}
                          >
                            {activityDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={getActivityColor(entry.name)} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} time slots`, name]}
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="intensity" className="mt-0">
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData}>
                    <defs>
                      <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      label={{ value: 'Minutes', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis domain={[0, 100]} />
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      formatter={(value, name) => [value, name === 'intensity' ? 'Intensity' : 'Productivity']}
                      labelFormatter={(time) => `Time: ${time} min`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="intensity" 
                      stroke="#16a34a" 
                      fill="url(#intensityGradient)" 
                      strokeWidth={2}
                      isAnimationActive={true}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="productivity" 
                      stroke="#3b82f6" 
                      fill="url(#productivityGradient)" 
                      strokeWidth={2}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="activities" className="mt-0">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Activity Intensity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={heatmapData}>
                          <XAxis dataKey="timeSlot" />
                          <YAxis domain={[0, 100]} />
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            formatter={(value, name) => [`${value}${name === 'intensity' ? '%' : ''}`, name === 'intensity' ? 'Intensity' : 'Switches']}
                          />
                          <Bar dataKey="intensity" fill="#16a34a" barSize={40} radius={[4, 4, 0, 0]}>
                            {heatmapData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.intensityColor} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Activity Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          innerRadius="30%" 
                          outerRadius="100%" 
                          data={heatmapData} 
                          startAngle={90} 
                          endAngle={-270}
                        >
                          <RadialBar
                            label={{ fill: '#666', position: 'insideStart' }}
                            background
                            dataKey="intensity"
                            nameKey="timeSlot"
                          >
                            {heatmapData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.activityColor}
                              />
                            ))}
                          </RadialBar>
                          <Tooltip
                            formatter={(value) => [`${value}%`, 'Intensity']}
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                          <Legend
                            iconSize={10}
                            layout="vertical"
                            verticalAlign="middle"
                            wrapperStyle={{ lineHeight: '40px' }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Productivity Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={timePointsData}>
                            <XAxis dataKey="time" />
                            <YAxis yAxisId="left" domain={[0, 100]} />
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                              formatter={(value, name) => [
                                `${value}${name === 'intensity' || name === 'productivityScore' ? '%' : ''}`, 
                                name === 'intensity' ? 'Intensity' : 'Productivity Score'
                              ]}
                            />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="intensity"
                              stroke="#16a34a"
                              strokeWidth={2}
                              dot={{ stroke: '#16a34a', strokeWidth: 2, r: 6 }}
                              activeDot={{ r: 8 }}
                              isAnimationActive={true}
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="productivityScore"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 6 }}
                              activeDot={{ r: 8 }}
                              isAnimationActive={true}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Activity Timeline</h3>
                  <div className="space-y-3">
                    {timePointsData.map((point, index) => (
                      <Card key={index} className="relative overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full w-1"
                          style={{ backgroundColor: point.eventType === 'session-start' ? '#16a34a' : '#3b82f6' }}
                        />
                        <CardContent className="p-4 pl-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium mb-1">{point.eventType === 'session-start' ? 'Session Start' : 'Context Switch'}</div>
                              <div className="text-xs text-gray-500">{point.time}</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                {point.intensity}% Intensity
                              </Badge>
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                {point.productivityScore}% Productivity
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>

        <CardFooter className="border-t pt-4">
          <Button variant="outline" className="ml-auto">Export Report</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TimelineData;