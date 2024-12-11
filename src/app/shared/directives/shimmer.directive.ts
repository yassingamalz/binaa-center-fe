// src/app/shared/directives/shimmer.directive.ts
import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appShimmer]'
})
export class ShimmerDirective implements OnChanges {
  @Input('appShimmer') isLoading = false;

  private originalStyles: { [key: string]: string } = {};
  private shimmerClass = 'shimmer-effect';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    // Store original styles
    const element = this.el.nativeElement;
    this.originalStyles = {
      backgroundColor: element.style.backgroundColor,
      color: element.style.color,
      borderColor: element.style.borderColor
    };
  }

  ngOnChanges(): void {
    if (this.isLoading) {
      this.addShimmerEffect();
    } else {
      this.removeShimmerEffect();
    }
  }

  private addShimmerEffect(): void {
    const element = this.el.nativeElement;
    this.renderer.addClass(element, this.shimmerClass);
  }

  private removeShimmerEffect(): void {
    const element = this.el.nativeElement;
    this.renderer.removeClass(element, this.shimmerClass);
    
    // Restore original styles
    Object.entries(this.originalStyles).forEach(([property, value]) => {
      this.renderer.setStyle(element, property, value);
    });
  }
}

