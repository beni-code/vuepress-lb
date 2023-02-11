import{_ as n,W as s,X as a,a2 as e}from"./framework-a4372378.js";const t={},p=e(`<h1 id="_5-1-子系统的启动和终止" tabindex="-1"><a class="header-anchor" href="#_5-1-子系统的启动和终止" aria-hidden="true">#</a> 5.1 子系统的启动和终止</h1><p>游戏引擎是一个复杂软件，由多个互相合作的子系统结合而成。当引擎启动时，必须依次配置及初始化每个子系统。各子系统间的相互依赖关系，隐含地定义了每个子系统所需的启动次序。</p><p>例如，子系统B依赖于子系统A，那么在启动B之前，必须先启动A。各子系统的终止通常会采用反向次序，即先终止B，再终止A。</p><h2 id="_5-1-1-c-的静态初始化次序-是不可用的" tabindex="-1"><a class="header-anchor" href="#_5-1-1-c-的静态初始化次序-是不可用的" aria-hidden="true">#</a> 5.1.1 C++的静态初始化次序(是不可用的)</h2><p>由于多数新式游戏引擎皆采用C++为编程语言，我们应考虑一下，C++原生的启动及终止语义是否可做启动及终止引擎子系统之用。在C++中，在调用程序进人点（main()或Windows下的WinMain())之前，全局对象及静态对象已被构建。然而，我们完全不可预知这些构造函数的调用次序<sup class="footnote-ref"><a href="#footnote1">[1]</a><a class="footnote-anchor" id="footnote-ref1"></a></sup>。在main()或winMain()结束返回之后，会调用全局对象及静态对象的析构函数，而这些函数的调用次序也是无法预知的。显而易见，此C++行为并不适合用来初始化及终止游戏引擎的子系统。实际上，这对任何含互相依赖全局对象的软件都不适合。</p><p>这实在令人遗憾，因为要实现各主要子系统，例如游戏引擎中的子系统，常见的设计模式是为每个子系统定义单例类(singleton class)，通常称作管理器(manager)。若C++能给予我们更多控制能力，指明全局或静态实例的构建、析构次序，那么我们就可以把单例定义为全局变量，而不必使用动态内存分配。例如，各子系统可写成以下形式：</p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token keyword">class</span> <span class="token class-name">RenderManager</span>
<span class="token punctuation">{</span>
<span class="token keyword">public</span> <span class="token operator">:</span>
	<span class="token function">RenderManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">// 启动管理器 …</span>
	<span class="token punctuation">}</span>

	<span class="token operator">~</span><span class="token function">RenderManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">// 终止管理器 …</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token comment">// 单例实例</span>
<span class="token keyword">static</span> RenderManager gRenderManager<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可惜，由于没法直接控制构建、析构次序，此方法行不通。</p><h3 id="_5-1-1-1-按需构建" tabindex="-1"><a class="header-anchor" href="#_5-1-1-1-按需构建" aria-hidden="true">#</a> 5.1.1.1 按需构建</h3><p>要应对此问题，可使用一个C++的小技巧：在函数内声明的静态变量并不会于main()之前构建，而是在第一次调用该函数时才构建的。因此，若把全局单例改为静态变量，我们就可以控制全局单例的构建次序。<sup class="footnote-ref"><a href="#footnote2">[2]</a><a class="footnote-anchor" id="footnote-ref2"></a></sup></p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token keyword">class</span> <span class="token class-name">RenderManager</span>
<span class="token punctuation">{</span>
<span class="token keyword">public</span><span class="token operator">:</span>
    <span class="token comment">// 取得唯一实例 </span>
    <span class="token keyword">static</span> RenderManager<span class="token operator">&amp;</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span> 
    <span class="token punctuation">{</span> 
        <span class="token comment">// 此函数中的静态变量将于函数被首次调用时构建 </span>
        <span class="token keyword">static</span> RenderManager sSingleton<span class="token punctuation">;</span>
        <span class="token keyword">return</span> sSingleton<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token function">RenderManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 对于需依赖的管理器，先通过调用它们的get()启动它们</span>
        <span class="token class-name">VideoManager</span><span class="token double-colon punctuation">::</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">TextureManager</span><span class="token double-colon punctuation">::</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        
        <span class="token comment">//现在启动渲染管理器</span>
        <span class="token comment">// </span>
    <span class="token punctuation">}</span>
    
    <span class="token operator">~</span><span class="token function">RenderManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">//终止管理器</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>你会发现，许多软件工程教科书都会建议用此方法，或以下这种含动态分配单例的变种：</p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token keyword">static</span> RenderManager<span class="token operator">&amp;</span> <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">static</span> RenderManager<span class="token operator">*</span> gpSingleton <span class="token operator">=</span> <span class="token constant">NULL</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>gpSingleton <span class="token operator">==</span> <span class="token constant">NULL</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        gpSingleton <span class="token operator">=</span> <span class="token keyword">new</span> RenderManager<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    
    <span class="token function">ASSERT</span><span class="token punctuation">(</span>gpSingleton<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token operator">*</span>gpSingleton<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>遗憾的是，此方法不可控制析构次序。例如，在RenderManager析构之前，其依赖的单例可能已被析构。而且，很难预计RenderManager单例的确切构建时间，因为第一次调用<code>RenderManager::get()</code>时，单例就会被构建，天知道那是什么时候！此外，使用该类的程序员可能不会预期，貌似无伤大雅的get()函数可能会有很高的开销，例如，分配及初始化一个重量级的单例。此法仍是难以预计旦危险的设计。这促使我们诉诸更直接、有更大控制权的方法。</p><h2 id="_5-1-2-行之有效的简单方法" tabindex="-1"><a class="header-anchor" href="#_5-1-2-行之有效的简单方法" aria-hidden="true">#</a> 5.1.2 行之有效的简单方法</h2><p>假设我们对子系统继续采用单例管理器的概念。最简单的“蛮力“方法就是，明确地为各单例管理器类定义启动和终止函数。这些函数取代了构造函数和析构函数，实际上，我们会让构造函数和析构函数完全不做任何事情。这样的话，就可以在main()中(或某个管理整个引擎的单例中)，按所需的明确次序调用各启动和终止函数。例如：</p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token keyword">class</span> <span class="token class-name">RenderManager</span>
<span class="token punctuation">{</span>
<span class="token keyword">public</span><span class="token operator">:</span>
    <span class="token function">RenderManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 不做事情</span>
    <span class="token punctuation">}</span>
    
    <span class="token operator">~</span><span class="token function">RenderManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 不做事情</span>
    <span class="token punctuation">}</span>
    
    <span class="token keyword">void</span> <span class="token function">startUp</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 启动管理器</span>
    <span class="token punctuation">}</span>
    
    <span class="token keyword">void</span> <span class="token function">shutDown</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 终止管理器</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">class</span> <span class="token class-name">PhysicsManager</span> <span class="token punctuation">{</span> <span class="token comment">/*类似内容 …… */</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token keyword">class</span> <span class="token class-name">AnimationManager</span> <span class="token punctuation">{</span> <span class="token comment">/*类似内容 …… */</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token keyword">class</span> <span class="token class-name">MemoryManager</span> <span class="token punctuation">{</span> <span class="token comment">/*类似内容 …… */</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token keyword">class</span> <span class="token class-name">FileSystemManager</span> <span class="token punctuation">{</span> <span class="token comment">/*类似内容 …… */</span><span class="token punctuation">]</span><span class="token punctuation">;</span>

<span class="token comment">// ……</span>

RenderManager gRenderManager<span class="token punctuation">;</span>
PhysicsManager gPhysicsManager<span class="token punctuation">;</span>
AnimationManager gRnimationManager；
TextureManager gTextureManager<span class="token punctuation">;</span>
VideoManager gVideoManager；
MemoryManager gMemoryManager；
FileSystemManager gFileSysteManager<span class="token punctuation">;</span>

<span class="token comment">// ……</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token keyword">int</span> argc， <span class="token keyword">const</span> <span class="token keyword">char</span><span class="token operator">*</span> argv<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">// 以正确次序启动各引擎系统</span>
    gMemoryManager<span class="token punctuation">.</span><span class="token function">startUp</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gFileSystemManager<span class="token punctuation">.</span><span class="token function">startUp</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gVideoManager<span class="token punctuation">.</span><span class="token function">startUp</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gTextureManager<span class="token punctuation">.</span><span class="token function">startUp</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gRenderManager<span class="token punctuation">.</span><span class="token function">startUp</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gAnimationManager<span class="token punctuation">.</span><span class="token function">startUp</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gPhysicsManager<span class="token punctuation">.</span><span class="token function">startUp</span><span class="token punctuation">(</span><span class="token punctuation">)</span>；

    <span class="token comment">// ……</span>

    <span class="token comment">// 运行游戏</span>
    gSimulationManager<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 以反向次序终止各引擎系统</span>
    <span class="token comment">// ……</span>
    gPhysicsManager<span class="token punctuation">.</span><span class="token function">shutDown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gAnimationManager<span class="token punctuation">.</span><span class="token function">shutDown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gRenderManager<span class="token punctuation">.</span><span class="token function">shutDown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gTextureManager<span class="token punctuation">.</span><span class="token function">shutDown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gVideoManager<span class="token punctuation">.</span><span class="token function">shutDown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gFileSystemManager<span class="token punctuation">.</span><span class="token function">shutDown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    gMemoryManager<span class="token punctuation">.</span><span class="token function">shutDown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此法还有“更优雅“的实现方式。例如，可以让各管理器把自己登记在一个全局的优先队列(priority queue)中，之后再按恰当次序逐一启动所有管理器。此外，也可以通过每个管理器列举其依赖的管理器，定义一个管理器间的依赖图(dependency graph)，然后按互相依赖关系计算最优的启动次序。5.1.1节提及的按需构建也是可行方式<sup class="footnote-ref"><a href="#footnote3">[3]</a><a class="footnote-anchor" id="footnote-ref3"></a></sup>。根据笔者的经验，蛮力方法总优于其他方法，因为：</p><ul><li>此方法既简单又容易实现。</li><li>此方法是明确的。看看代码就能立即得知启动次序。</li><li>此方法容易调试和维护。若某子系统启动时机不够早或过早，只需移动一行代码。</li></ul><p>用蛮力方法手动启动及终止子系统，还有一个小缺点，就是程序员有可能意外地终止一些子系统，而非按启动的相反次序。但这一缺点并不会使笔者失眠，因为只要能成功启动及终止引擎的各子系统，你的任务就完成了。</p><h2 id="_5-1-3-一些实际引擎的例子" tabindex="-1"><a class="header-anchor" href="#_5-1-3-一些实际引擎的例子" aria-hidden="true">#</a> 5.1.3 一些实际引擎的例子</h2><p>下面来看一些来自实际引擎的启动、终止例子。</p><h3 id="_5-1-3-1-ogre" tabindex="-1"><a class="header-anchor" href="#_5-1-3-1-ogre" aria-hidden="true">#</a> 5.1.3.1 OGRE</h3><p>OGRB的作者承认OGRE本质上是渲染引擎而非游戏引擎。但它也必须提供许多完整游戏引擎都有的底层功能，包括一个简单优雅的启动/终止机制。OGRE中的一切对象都由Ogre::Root单例控制。此单例含有指向其他OGRE子系统的指针，并负责启动和终止这些子系统。此设计使程序员能轻松启动OGRE，只需new一个Ogre::Root实例就可以了。</p><p>以下是一些OGRE的代码片段，从中可以理解其工作方式。</p><p><em>OgreRoot.h:</em></p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token keyword">class</span> <span class="token class-name">_OgreExport</span> Root <span class="token operator">:</span> <span class="token keyword">public</span> Singleton<span class="token operator">&lt;</span>Root<span class="token operator">&gt;</span>
<span class="token punctuation">{</span>
    <span class="token comment">// 忽略一些代码…...</span>

    <span class="token comment">// 各单例</span>
    LogManager<span class="token operator">*</span> mLuogManager<span class="token punctuation">;</span>
    ControllerManager<span class="token operator">*</span> mControllerManager<span class="token punctuation">;</span>
    SceneManagerEnumerator<span class="token operator">*</span> mSceneManagerEnum<span class="token punctuation">;</span>
    SceneManager<span class="token operator">*</span> mCurrentSceneManager<span class="token punctuation">;</span>
    DynLibManager<span class="token operator">*</span> mDynLibManager<span class="token punctuation">;</span>
    ArchiveManager<span class="token operator">*</span> mArchiveManager<span class="token punctuation">;</span>
    MaterialManager<span class="token operator">*</span> mMaterialManager<span class="token punctuation">;</span>
    MeshManager<span class="token operator">*</span> mMeshManager<span class="token punctuation">;</span>
    ParticleSystemManager<span class="token operator">*</span> mParticleManager<span class="token punctuation">;</span>
    SkeletonManager<span class="token operator">*</span> mSkeletonManager<span class="token punctuation">;</span>
    OverlayElementFactory<span class="token operator">*</span> mPanelFactory<span class="token punctuation">;</span>
    OverlayElementFactory<span class="token operator">*</span> mBorderPanelFactor<span class="token punctuation">;</span>
    OverlayElementFactory<span class="token operator">*</span> mTextAreaFactory<span class="token punctuation">;</span>
    OverlayManager<span class="token operator">*</span> mOverlayManager<span class="token punctuation">;</span>
    FontManager<span class="token operator">*</span> mFontManager<span class="token punctuation">;</span>
    ArchiveFactory<span class="token operator">*</span> mZipArchiveFactory<span class="token punctuation">;</span>
    ArchiveFactory<span class="token operator">*</span> mFileSystemArchiveFactory<span class="token punctuation">;</span>
    ResourceGroupManager<span class="token operator">*</span> mResourceGroupManager<span class="token punctuation">;</span>
    ResourceBackgoundQueue<span class="token operator">*</span> mResourceBackgroundQueue<span class="token punctuation">;</span>
    ShadowTextureManager<span class="token operator">*</span> mShadowTextureManager<span class="token punctuation">;</span>
    <span class="token comment">// 等等</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><em>OgreRoot.cpp</em></p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code><span class="token class-name">Root</span><span class="token double-colon punctuation">::</span><span class="token function">Root</span><span class="token punctuation">(</span><span class="token keyword">const</span> String<span class="token operator">&amp;</span> pluginFileName，
           <span class="token keyword">const</span> String<span class="token operator">&amp;</span> configFileName，
           <span class="token keyword">const</span> String<span class="token operator">&amp;</span> logFileName<span class="token punctuation">)</span> <span class="token operator">:</span> 
        <span class="token function">mLogManager</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span>，
        <span class="token function">mCurrentFrame</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span>，
        <span class="token function">mFrameSmoothingTime</span><span class="token punctuation">(</span><span class="token number">0.0f</span><span class="token punctuation">)</span>，
        <span class="token function">mNextMovableObjectTypeFlag</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>，
        <span class="token function">mIsInitiailised</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">// 基类会检查单例</span>
    String msg<span class="token punctuation">;</span>
    <span class="token comment">// 初始化</span>
    mActiveRenderer <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
    mVersion <span class="token operator">=</span> <span class="token class-name">StringConverter</span><span class="token double-colon punctuation">::</span><span class="token function">toString</span><span class="token punctuation">(</span>OGRE_VERSION_MRJOR<span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token string">&quot;.&quot;</span>
             <span class="token operator">+</span> <span class="token class-name">StringConverter</span><span class="token double-colon punctuation">::</span><span class="token function">toString</span><span class="token punctuation">(</span>OGRE_VERSION_MINOR<span class="token punctuation">)</span> <span class="token operator">+</span> <span class="token string">&quot;.&quot;</span>
             <span class="token operator">+</span> <span class="token class-name">StringConverter</span><span class="token double-colon punctuation">::</span><span class="token function">toString</span><span class="token punctuation">(</span>OGRE_VERSION_PATCH<span class="token punctuation">)</span>
             <span class="token operator">+</span> OGRE_VERSION_SHUFFIX <span class="token operator">+</span> <span class="token string">&quot; &quot;</span>
             <span class="token operator">+</span> <span class="token string">&quot;(&quot;</span> <span class="token operator">+</span> OGRE_VERSION_NAME <span class="token operator">+</span> <span class="token string">&quot;)&quot;</span><span class="token punctuation">;</span>
    mConfigFileName <span class="token operator">=</span> configFileName<span class="token punctuation">;</span>

    <span class="token comment">// 若没有日志管理员，建立日志管理员及默认日志文件</span>
    <span class="token keyword">if</span><span class="token punctuation">(</span><span class="token class-name">LogManager</span><span class="token double-colon punctuation">::</span><span class="token function">getSingletonPtr</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        mLogManager <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token function">LogManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        mLogManager <span class="token operator">-&gt;</span> <span class="token function">createLog</span><span class="token punctuation">(</span>logFileName， <span class="token boolean">true</span>， <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 动态库管理员</span>
    mDynLibManager <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token function">DynLibManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    mArchiveManager <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token function">ArchiveManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 资源群管理员</span>
    mResourceGroupManager <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token function">ResourceGroupManager</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 资源背景队列</span>
    mResourceBackgrounQueue <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token function">ResourceBackgroundQueue</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 等等</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>OGRE提供了一个<code>Ogre::Singleton</code>模板基类，所有管理器都派生自此基类。在<code>Ogre::Singleton</code>的实现里，并不会进行延迟构建，而是依赖于<code>Ogre::Root</code>明确地new每个单例。如上所述，这样可以确定每个单例会以定义的明确次序创建及毁灭这些单例。<sup class="footnote-ref"><a href="#footnote4">[4]</a><a class="footnote-anchor" id="footnote-ref4"></a></sup></p><h3 id="_5-1-3-2-顽皮狗的神秘海域系列和最后生还者" tabindex="-1"><a class="header-anchor" href="#_5-1-3-2-顽皮狗的神秘海域系列和最后生还者" aria-hidden="true">#</a> 5.1.3.2 顽皮狗的神秘海域系列和最后生还者</h3><p>顽皮狗开发的神秘海域/最后生还者引擎采用了一个相似的明确方法去启动和终止各子系统。读者会发现，以下的引擎启动代码并非总是一串简单的单例分配。许多不同的操作系统服务、第三方库等，都必须在引擎初始化时启动。并且在可行情况下，代码中会尽量避免动态内存分配，所以许多单例是静态分配的对象（如g_fileSystem、g_languageMgr等)。这段代码不一定好看，但总可以完成任务。</p><div class="language-cpp line-numbers-mode" data-ext="cpp"><pre class="language-cpp"><code>Err <span class="token function">BigInit</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token function">init_exception_handler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    U8<span class="token operator">*</span> pPhysicsHeap <span class="token operator">=</span> <span class="token keyword">new</span><span class="token punctuation">(</span>kAllocGlobal<span class="token punctuation">,</span> kAlign16<span class="token punctuation">)</span>U8<span class="token punctuation">[</span>ALLOCATION_GLOBAL_PHYS_HEAP<span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token function">PhysicsAllocatorInit</span><span class="token punctuation">(</span>pPhysicsHeap<span class="token punctuation">,</span> ALLOCATION_GLOBAL_PHYS_HEAP<span class="token punctuation">)</span><span class="token punctuation">;</span>

    g_textDb<span class="token punctuation">.</span><span class="token function">Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    g_textSubDb<span class="token punctuation">.</span><span class="token function">Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    g_spuMgr<span class="token punctuation">.</span><span class="token function">Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    
    g_drawScript<span class="token punctuation">.</span><span class="token function">InitPlatform</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    
    <span class="token function">PlatformUpdate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    thread_t init_thr<span class="token punctuation">;</span>
    <span class="token function">thread_create</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>init_thr<span class="token punctuation">,</span> threadInit<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">30</span><span class="token punctuation">,</span> <span class="token number">64</span><span class="token operator">*</span><span class="token number">1024</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token string">&quot;Init&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">char</span> masterConfigFileName<span class="token punctuation">[</span><span class="token number">256</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    <span class="token function">snprintf</span><span class="token punctuation">(</span>masterConfigFileName<span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>masterConfigFileName<span class="token punctuation">)</span><span class="token punctuation">,</span> MASTER_CFG_PATH<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">{</span>
        Err err <span class="token operator">=</span> <span class="token function">ReadConfigFromFile</span><span class="token punctuation">(</span>
        masterConfigFileName<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>err<span class="token punctuation">.</span><span class="token function">Failed</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token function">MsgErr</span><span class="token punctuation">(</span><span class="token string">&quot;Config file not found (%s).\\n&quot;</span><span class="token punctuation">,</span>
            masterConfigFileName<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
    <span class="token function">memset</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>g_discInfo<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span>BootDiscInfo<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">int</span> err1 <span class="token operator">=</span> <span class="token function">GetBootDiscInfo</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>g_discInfo<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">Msg</span><span class="token punctuation">(</span><span class="token string">&quot;GetBootDiscInfo() : 0x%x\\n&quot;</span><span class="token punctuation">,</span> err1<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span><span class="token punctuation">(</span>err1 <span class="token operator">==</span> BOOTDISCINFO_RET_OK<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;titleId : [%s]\\n&quot;</span><span class="token punctuation">,</span> g_discInfo<span class="token punctuation">.</span>titleId<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;parentalLevel : [%d]\\n&quot;</span><span class="token punctuation">,</span> g_discInfo<span class="token punctuation">.</span>parentalLevel<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    g_fileSystem<span class="token punctuation">.</span><span class="token function">Init</span><span class="token punctuation">(</span>g_gameInfo<span class="token punctuation">.</span>m_onDisc<span class="token punctuation">)</span><span class="token punctuation">;</span>
    g_languageMgr<span class="token punctuation">.</span><span class="token function">Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>g_shouldQuit<span class="token punctuation">)</span> <span class="token keyword">return</span> Err<span class="token double-colon punctuation">::</span>kOK<span class="token punctuation">;</span>
    <span class="token comment">// and so on...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr class="footnotes-sep"><section class="footnotes"><ol class="footnotes-list"><li id="footnote1" class="footnote-item"><p>在GCC中可使用init_priority()属性设定变量的初始化次序。 <a href="#footnote-ref1" class="footnote-backref">↩︎</a></p></li><li id="footnote2" class="footnote-item"><p>这称作Meyers单例，延续于ScottMeyers的 More fective C++。一一译者注 <a href="#footnote-ref2" class="footnote-backref">↩︎</a></p></li><li id="footnote3" class="footnote-item"><p>要解决按需构建方式的析构次序问题，可以在单例构建时，把自己登记在一个全局堆栈中，在main()结束之前，逐一把堆栈弹出并调用其终止函数。此方法假设单例的终止次序可以与启动次序相反，但理论上不能解决所有情况。一一译者注 <a href="#footnote-ref3" class="footnote-backref">↩︎</a></p></li><li id="footnote4" class="footnote-item"><p>此方法也有一个缺点，扩展引擎时必须更改<code>Ogre::Root</code>的代码。此违反了开闭原则(open-closed principle)，尤其会影响闭源引擎的可扩展性。一一译者注 <a href="#footnote-ref4" class="footnote-backref">↩︎</a></p></li></ol></section>`,35),o=[p];function c(i,l){return s(),a("div",null,o)}const r=n(t,[["render",c],["__file","2.html.vue"]]);export{r as default};
