// src/app/shared/directives/shimmer.directive.ts
import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appShimmer]'
})
export class ShimmerDirective implements OnChanges {
  @Input('appShimmer') isLoading = false;

  private shimmerClass = 'shimmer-effect';
  private originalPosition: string;
  private originalBackground: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    // Store original styles
    this.originalPosition = this.el.nativeElement.style.position;
    this.originalBackground = this.el.nativeElement.style.background;
  }

  ngOnChanges(): void {
    if (this.isLoading) {
      this.addShimmerEffect();
    } else {
      this.removeShimmerEffect();
    }
  }

  private addShimmerEffect(): void {
    this.renderer.addClass(this.el.nativeElement, this.shimmerClass);
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');

    // Create shimmer overlay
    const overlay = this.renderer.createElement('div');
    this.renderer.addClass(overlay, 'shimmer-overlay');
    this.renderer.appendChild(this.el.nativeElement, overlay);

    // Create shimmer animation element
    const shimmer = this.renderer.createElement('div');
    this.renderer.addClass(shimmer, 'shimmer-animation');
    this.renderer.appendChild(overlay, shimmer);
  }

  private removeShimmerEffect(): void {
    // Remove all shimmer related elements and classes
    this.renderer.removeClass(this.el.nativeElement, this.shimmerClass);
    this.renderer.setStyle(this.el.nativeElement, 'position', this.originalPosition || null);
    this.renderer.setStyle(this.el.nativeElement, 'background', this.originalBackground || null);

    // Remove overlay
    const overlay = this.el.nativeElement.querySelector('.shimmer-overlay');
    if (overlay) {
      this.renderer.removeChild(this.el.nativeElement, overlay);
    }
  }
}
