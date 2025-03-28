
import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { SegmentedPanelsProps } from '@/types/chartTypes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import RechartsDisplay from './RechartsDisplay';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SegmentedPanels: React.FC<SegmentedPanelsProps> = ({
  timeSegments,
  signals,
  selectedSegment,
  onSegmentChange,
  chartType,
  getPanelSignals
}) => {
  const [zoomDomain, setZoomDomain] = useState<{ start?: number, end?: number }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom domain when segment changes to show full segment
  useEffect(() => {
    setZoomDomain({});
  }, [selectedSegment]);

  // Handle zoom domain changes
  const handleZoomDomainChange = (domain: any) => {
    if (!domain || (domain.start === 'dataMin' && domain.end === 'dataMax')) {
      setZoomDomain({});
    } else {
      setZoomDomain(domain);
      toast.info(`Zoomed to selected time range`);
    }
  };

  // Handle brush change
  const handleBrushChange = (brushData: any) => {
    console.log("Brush data:", brushData);
    // This only tracks the brush activity
  };

  // Handle segment navigation
  const navigateSegment = (direction: 'next' | 'previous') => {
    const currentIndex = timeSegments.findIndex(s => s.id === selectedSegment);
    if (currentIndex === -1) return;
    
    let newIndex = currentIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % timeSegments.length;
    } else {
      newIndex = (currentIndex - 1 + timeSegments.length) % timeSegments.length;
    }
    
    onSegmentChange(timeSegments[newIndex].id);
    toast.info(`Moved to ${direction} segment`);
  };

  if (timeSegments.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">No time segments available</p>
        </CardContent>
      </Card>
    );
  }

  // Get the selected segment's data and signals
  const selectedSegmentData = timeSegments.find(s => s.id === selectedSegment)?.data || [];
  const panelSignals = getPanelSignals('panel-1'); // Using first panel for all segments

  // Find current segment index for navigation
  const currentSegmentIndex = timeSegments.findIndex(s => s.id === selectedSegment);

  return (
    <div className="space-y-4">
      <Tabs value={selectedSegment} onValueChange={onSegmentChange}>
        <div className="mb-2">
          <p className="text-sm text-muted-foreground mb-1">Time segments (approximately 5000 points each)</p>
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex flex-nowrap h-auto py-1 px-1">
              {timeSegments.map(segment => (
                <TabsTrigger 
                  key={segment.id} 
                  value={segment.id}
                  className="text-xs py-1 px-2 h-auto whitespace-nowrap"
                >
                  {format(segment.startTime, 'HH:mm:ss')} - {format(segment.endTime, 'HH:mm:ss')} 
                  <span className="text-xs text-muted-foreground ml-1">({segment.data.length} points)</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
      </Tabs>

      {/* Segment navigation controls */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigateSegment('previous')}
          disabled={timeSegments.length <= 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Segment
        </Button>
        
        <span className="text-sm text-muted-foreground">
          Segment {currentSegmentIndex + 1} of {timeSegments.length}
        </span>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigateSegment('next')}
          disabled={timeSegments.length <= 1}
          className="flex items-center gap-1"
        >
          Next Segment
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Segment chart display */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <div>
              {timeSegments.find(s => s.id === selectedSegment) && (
                <>
                  Time Segment: {format(timeSegments.find(s => s.id === selectedSegment)!.startTime, 'HH:mm:ss')} - {format(timeSegments.find(s => s.id === selectedSegment)!.endTime, 'HH:mm:ss')}
                </>
              )}
            </div>
            <button 
              onClick={() => setZoomDomain({})}
              className="text-xs text-primary hover:text-primary/80 underline"
            >
              Reset Zoom
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]" ref={containerRef}>
            <RechartsDisplay
              chartType={chartType}
              visibleChartData={selectedSegmentData}
              signals={panelSignals}
              zoomDomain={zoomDomain}
              onZoomDomainChange={handleZoomDomainChange}
              containerRef={containerRef}
              onBrushChange={handleBrushChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SegmentedPanels;
